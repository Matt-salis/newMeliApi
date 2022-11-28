import tokenService from "./tokenService"

class errorsService {

    handleError(err) {
      if (err.response != null) {
        if (err.response.error == "invalid_grant") {
          return tokenService.checkParam()
        }
        if (err.response.message == "Invalid token") {
          return tokenService.refreshToken()
        }
      } else {
        return console.log(err)
      }
    }
}
export default new errorsService()