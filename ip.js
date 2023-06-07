const os = require("os");
console.log(Object.values(os.networkInterfaces())[1][3].address)