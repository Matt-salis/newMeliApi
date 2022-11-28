<template> 
    <nav class="inline">
      
      <RouterLink class="nodeco" to="/"><img style="width: 30px; height: auto;" src="../../public/favicon.ico" alt=""> Inicio</RouterLink>
      <a>|</a>
      <RouterLink class="nodeco" to="/busqueda-productos">Busqueda de Productos</RouterLink>
      <a>|</a>
      <RouterLink class="nodeco" to="/busqueda-usuarios">Busqueda de Usuarios</RouterLink>
      <a>|</a>
      <RouterLink class="nodeco" to="/competencia">Competencia</RouterLink>
      <!-- <p style="position: absolute; right: 30px;">{{nickname}}</p> -->
    </nav>
</template>

<script>
import { defineComponent } from 'vue';
import usuarioService from '../service/usuarioService';

export default defineComponent({
    data() {
      return {
      nickname: '',
      }
    },
    // mounted() {
    //   this.getMyUser()
    //     // this.nickname = usuarioService.getMyUser()
    // },
    // methods: {
    //   getMyUser() {
    //   var token = window.localStorage.getItem('token')
    //   $.ajax({
    //       type: "GET",
    //       url: "https://api.mercadolibre.com/users/me",
    //       authorization: "Bearer " + token,
    //     }).then((res) => {
    //       // window.localStorage.setItem('nickname', res.nickname)
    //       this.nickname = res.nickname 
    //     }).catch((err) => {
    //       console.log(err)
    //       // return errorsService.handleError(err)
    //     }) 
    //   }
    // }
  })
</script>