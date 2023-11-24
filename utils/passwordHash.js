
const bcrypt = require("bcrypt")


const securepassword = async (password) => {
    try {

         const paswordHash = await bcrypt.hash(password, 10)

        return paswordHash

    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {securepassword} 
