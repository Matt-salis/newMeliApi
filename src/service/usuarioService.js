import errorsService from "./errorsService"

class usuarioService {

    // getMyUser() {
    //   var token = window.localStorage.getItem('token')
    //   $.ajax({
    //       type: "GET",
    //       url: "https://api.mercadolibre.com/users/me",
    //       authorization: "Bearer " + token,
    //     }).then((res) => {
    //       window.localStorage.setItem('nickname', res.nickname)
    //       return res.nickname 
    //     }).catch((err) => {
    //       return errorsService.handleError(err)
    //     }) 
    //   }
        
    // getUserByNickname(nickname) {
    //   var token = window.localStorage.getItem('token')
    //   $.ajax({
    //       type: "GET",
    //       url: "https://api.mercadolibre.com/sites/MLA/search?nickname=" + nickname,
    //       authorization: "Bearer " + token,
    //     }).then((res) => {
    //       return res.nickname 
    //     }).catch((err) => {
    //       return errorsService.handleError(err)
    //     }) 

    // }
}
export default new usuarioService()