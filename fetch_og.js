const fs = require('fs');
fetch('https://maps.app.goo.gl/UffNtSb8iFy1xGiv9')
    .then(res => res.text())
    .then(text => fs.writeFileSync('out.html', text));
