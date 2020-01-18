const { generateRandomPassword, generateUsername } = require('./cloud/util');

main();


function main() {
  for (let i=0; i<20; i++) {
    console.log(generateRandomPassword())
  }

  console.log(generateUsername('Matthew', 'Ha'))
}
