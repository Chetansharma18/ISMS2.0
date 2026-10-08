const fs = require('fs');
const filePath = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `              <!-- Alternate Mobile No. -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Alternate Mobile No.</label>
                <input
                  type="text"
                  maxlength="10"
                  placeholder="Optional alternate mobile"
                  [(ngModel)]="formData.alternateMobileNo"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
                />
              </div>

              <!-- Alternate E-Mail -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Alternate E-Mail</label>
                <input
                  type="email"
                  placeholder="Optional alternate email"
                  [(ngModel)]="formData.alternateEmail"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
                />
              </div>`;

content = content.replace(targetStr, '');
const targetStrCrlf = targetStr.replace(/\n/g, '\r\n');
content = content.replace(targetStrCrlf, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fields removed');
