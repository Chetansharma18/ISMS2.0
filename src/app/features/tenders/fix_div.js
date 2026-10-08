const fs = require('fs');
const filePath = 'd:/ISMS/ISMS2.0/src/app/features/tenders/tenders-page.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `                      </label>
                    }
                  </div>
                }`;

const replacementStr = `                      </label>
                    }
                    </div>
                  </div>
                }`;

content = content.replace(targetStr, replacementStr);
const targetStrCrlf = targetStr.replace(/\n/g, '\r\n');
content = content.replace(targetStrCrlf, replacementStr.replace(/\n/g, '\r\n'));

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed missing div');
