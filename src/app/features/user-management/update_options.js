const fs = require('fs');

const filePath = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `<option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="TP">Training Partner (TP)</option>
                </select>
                <div class="text-[11px] text-slate-500 mt-0.5">Select user classification (Admin, Super Admin, or TP).</div>`;

const replacement1 = `<option value="Super Admin">Super Admin</option>
                  <option value="Department">Department</option>
                  <option value="Citizen">Citizen</option>
                </select>
                <div class="text-[11px] text-slate-500 mt-0.5">Select user classification (Super Admin, Department, or Citizen).</div>`;

const target2 = `<option value="" disabled selected>Select Role Type</option>
                  <option value="tp">tp</option>
                  <option value="scheme oc">scheme oc</option>
                  <option value="mis manager">mis manager</option>
                  <option value="programmer">programmer</option>
                  <option value="gm">gm</option>
                  <option value="zc">zc</option>
                  <option value="md">md</option>
                  <option value="super admin">super admin</option>`;

const replacement2 = `<option value="" disabled selected>Select Role Type</option>
                  <option value="OIC">OIC</option>
                  <option value="manager">manager</option>
                  <option value="super admin">super admin</option>
                  <option value="S.A">S.A</option>
                  <option value="Admin">Admin</option>
                  <option value="ZC">ZC</option>`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

// Handle CRLF if needed
const target1_crlf = target1.replace(/\n/g, '\r\n');
const replacement1_crlf = replacement1.replace(/\n/g, '\r\n');
content = content.replace(target1_crlf, replacement1_crlf);

const target2_crlf = target2.replace(/\n/g, '\r\n');
const replacement2_crlf = replacement2.replace(/\n/g, '\r\n');
content = content.replace(target2_crlf, replacement2_crlf);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated dropdown options');
