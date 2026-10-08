const fs = require('fs');
const filePath = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

const aadhaarBlock = `              <!-- Aadhaar Id -->
              <div>
                <label class="block text-slate-700 font-medium mb-1">Aadhaar Id</label>
                <input
                  type="text"
                  maxlength="12"
                  placeholder="12-digit Aadhaar number"
                  [(ngModel)]="formData.aadhaarId"
                  class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800 font-mono text-xs"
                />
              </div>`;

// Remove from right column
content = content.replace(aadhaarBlock, '');
content = content.replace(aadhaarBlock.replace(/\n/g, '\r\n'), '');

// Add to left column (before RIGHT COLUMN)
const leftColumnEnd = `            </div>\r
\r
            <!-- RIGHT COLUMN -->`;
const leftColumnEndFallback = `            </div>\n\n            <!-- RIGHT COLUMN -->`;

if (content.includes(leftColumnEnd)) {
  content = content.replace(leftColumnEnd, aadhaarBlock.replace(/\n/g, '\r\n') + '\r\n' + leftColumnEnd);
} else if (content.includes(leftColumnEndFallback)) {
  content = content.replace(leftColumnEndFallback, aadhaarBlock + '\n' + leftColumnEndFallback);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Aadhaar moved to left column');
