const fs = require('fs');
const path = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';

let content = fs.readFileSync(path, 'utf8');

// The HTML currently has:
// </button>
// 
// </div>
//
// @if (selectedRoleFilter() === 'blacklisted') {

const regex = /<\/button>\s*<\/div>\s*@if \(selectedRoleFilter\(\) === 'blacklisted'\) \{/;
const replacement = `</button>
      </div>
      }

      @if (selectedRoleFilter() === 'blacklisted') {`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed missing closing brace');
