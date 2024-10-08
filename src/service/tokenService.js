import usuarioService from "./usuarioService"
import router from "../router"

class tokenService {
    refreshToken() {
      var refresh = window.localStorage.get('refresh')
      $.ajax({
          type: "POST",
          url: "https://api.mercadolibre.com/oauth/token",
          accepts: "application/json",
          contenttype: "application/x-www-form-urlencoded",
          data: {
          'grant_type': 'refresh_token',
          'client_id': import.meta.env.VITE_CLIENTID,
          'client_secret': import.meta.env.VITE_CLIENTSECRET,
          'refresh_token': refresh,
          }
        }).then((res) => {
            var token = res.access_token
            var refresh = res.refresh_token
            window.localStorage.setItem('token', token)
            window.localStorage.setItem('refresh', refresh)
            //usuarioService.getMyUser();
            return console.log(token)
        }).catch((err) => {
            if (err.response.error == "invalid_grant") {
            return this.checkParam()
            }
        })
      }

      checkParam() {
        var querystr = window.location.search
        var urlparams = new URLSearchParams(querystr)
        var code = urlparams.get('code')
        if (code == null) {
          return window.location.replace('https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=3301773768813163&redirect_uri=https://matt-salis.github.io/meliAPP/')
        } else {
          this.code = code
          return this.createToken()
        }
      }

      createToken() {
        $.ajax({
          type: "POST",
          url: "https://api.mercadolibre.com/oauth/token",
          accepts: "application/json",
          contenttype: "application/x-www-form-urlencoded",
          data: {
          'grant_type': 'authorization_code',
          'client_id': import.meta.env.VITE_CLIENTID,
          'client_secret': import.meta.env.VITE_CLIENTSECRET,
          'code': this.code,
          'redirect_uri': 'https://matt-salis.github.io/meliAPP/'
          }
        }).then((res) => {
          var token = res.access_token
          var refresh = res.refresh_token
          window.localStorage.setItem('token', token)
          window.localStorage.setItem('refresh', refresh)
          router.push("/")
          //usuarioService.getMyUser();
         return console.log(token)
        }).catch((err) => {
          return console.log(err)
        })
      }
}
export default new tokenService()