<template>
    <div class="container">
      <h2>Busqueda de usuarios</h2>
      <div class="flex-inline">
        <input type="text" class="form-control" v-on:keyup.enter="buscarQuery()" v-model="queryBusqueda" placeholder="Ingrese un nombre de usuario">
        <button :disabled="queryBusqueda == ''" class="btn btn-primary" @click="buscarQuery()">Buscar</button>
      </div>


      <div style="border-top: 1px solid black; width: 100%;" class="mt-10">   
      </div>


      <div class="flex-inline" v-if="queryBusquedaOG != '' && results.seller == null">
        <p style="color: red;">No se encontro un usuario con ese nombre</p>
      </div>


      <div v-if="results.seller != null" class="flex-inline-between mt-10">
        <div class="border">
          <p style="font-size: large;">Nombre de usuario</p>
          <p>{{results.seller.nickname}}</p>
        </div>
        <!-- <div class="border">
          <p style="font-size: large;">Link al perfil</p>
          <p><a target="_blank" :href='results.seller.permalink'>{{results.seller.permalink}}</a></p>
        </div>
        <div class="border">
          <p style="font-size: large;">Fecha de registro</p>
          <p>{{ results.seller.registration_date }}</p>
        </div>
        <div class="border">
          <p style="font-size: large;">Reputacion de vendedor</p>
          <p>{{results.seller.seller_reputation.power_seller_status}}</p>
        </div>
        <div class="border">
          <p style="font-size: large;">Transacciones totales</p>
          <p>{{results.seller.seller_reputation.transactions.total}}</p>
        </div> -->
      </div>



      <div v-if="results.seller != null" class="flex-inline-between mt-10">
        <!-- <div class="border">
          <p style="font-size: large;">Transacciones canceladas</p>
          <p>{{results.seller.seller_reputation.transactions.canceled}}</p>
        </div>
        <div class="border">
          <p style="font-size: large;">Transacciones completadas</p>
          <p>{{results.seller.seller_reputation.transactions.completed}}</p>
        </div>
        <div class="border">
          <p style="font-size: large;">Ventas ultimos {{results.seller.seller_reputation.metrics.sales.period}}</p>
          <p>{{results.seller.seller_reputation.metrics.sales.completed}}</p>
        </div>
        <div class="border">
          <p style="font-size: large;">Puntuacion positiva</p>
          <p>{{Number(results.seller.seller_reputation.transactions.ratings.positive) * 100}}%</p>
        </div>
        <div class="border">
          <p style="font-size: large;">Publicaciones activas</p>
          <p>{{results.paging.total}}</p>
        </div> -->
      </div>


    <div style="border-top: 1px solid black; width: 100%;" class="mt-10">   
    </div>
    

    <div class="table-responsive" v-if="prodTable.length > 0" style="margin-top: 20px;">
        <table id="tabla" class="table table-bordered">
          <thead>
            <tr>
                <th>img de portada</th>
                <th>titulo</th>
                <th>link de la publicacion</th>
                <!-- <th>link del vendedor</th> -->
                <!-- <th>nombre del Eshop</th> -->
                <th>condicion</th>
                <th>precio</th>
                <th>cantidad disponible</th>
                <th>cantidad vendidos</th>
                <th>cuotas</th>
                <th>interes</th>
                <th>envio gratis</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, key) in prodTable" :key="key">
              <td><img style="max-width: 100px; max-height: 100px;" :src='result.thumbnail' alt="logo"></td>
              <td>{{result.title}}</td>
              <td><a :href='result.permalink'>{{result.permalink}}</a></td>
              <!-- <td><a :href='result.seller.permalink'>{{result.seller.permalink}}</a></td> -->
              <!-- <td>{{result.seller.eshop != null ? result.seller.eshop.nick_name : "-"}}</td> -->
              <td>{{result.condition}}</td>
              <td>{{result.price}}</td>
              <td>{{result.available_quantity}}</td>
              <td>{{result.sold_quantity}}</td>
              <td>{{result.installments != null ? result.installments.quantity : '-' }}</td>
              <td>%{{result.installments != null ? result.installments.rate : '-' }}</td>
              <td>{{result.shipping.free_shipping}}</td>
            </tr>
          </tbody>
        </table>
        <p>Las cantidades de items vendidos y disponibles son aproximaciones</p>
      </div>
    </div>

</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
    queryBusqueda: '',
    queryBusquedaOG: '',
    code: '',
    results: {},
    resultsOG: {},
    prodTable: []
    }
  },
  mounted() {
    var token = window.localStorage.getItem('token')
    if (token == null) {
      this.checkParam()
    }
  },
  methods: {
      buscarQuery() {
        // var filtros = "&item_condition=2230284";
        // var filtros = this.queryFiltros();
        // this.tablaFormateada = []
        // var token = window.localStorage.getItem('token')
        this.queryBusquedaOG = this.queryBusqueda
        var query = this.queryBusqueda.replaceAll(' ', '%20')
        var token = window.localStorage.getItem('token')
        $.ajax({
            type: "GET",
            url: "https://api.mercadolibre.com/sites/MLA/search?nickname=" + query,
            authorization: "Bearer " + token,
          }).then((res) => {
            this.results = res
            this.resultsOG = this.results
            if (this.results.seller != null) {
              this.results.seller.registration_date = this.formatFecha(new Date(this.results.seller.registration_date))
              this.prodTable = res.results
            } else {
              this.prodTable = []
            }
          }).catch((err) => {
            errorsService.handleError(err)
          }) 
        
      },
      formatFecha(date) {
        const fecha =
          date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
        return fecha
      },
      // formatTable() {
      //   this.results.forEach(x => {
      //     var json = {
      //       titulo: x.title,
      //       linkpubli: x.permalink,
      //       linkvendedor: x.seller.permalink,
      //       nombreeshop: x.seller.eshop != null ? x.seller.eshop.nick_name : '-',
      //       condicion: x.condition,
      //       precio: x.price,
      //       disponibles: x.available_quantity,
      //       vendidos: x.sold_quantity,
      //       cuotas: x.installments != null ? x.installments.quantity : '-',
      //       intereses: x.installments.rate != null ? x.installments.rate : '-',
      //       envio: x.shipping.free_shipping
      //     }
      //     if (x.installments == null) {
      //       console.log(x)
      //     }
      //     this.tablaFormateada.push(json)
      //   });
      // },
      // exportXlsx() {
      //   this.formatTable()
      //   var busqueda = this.queryBusquedaOG.replaceAll(" ", "-")
      //   var worksheet = XLSX.utils.json_to_sheet(this.tablaFormateada)
      //   const workbook = XLSX.utils.book_new();
      //   XLSX.utils.book_append_sheet(workbook, worksheet, "Publicaciones");
      //   XLSX.utils.sheet_add_aoa(worksheet, [[ "titulo", "link de la publicacion", "link del vendedor", "nombre del Eshop", "condicion", "precio", "cantidad disponible", "cantidad vendidos", "cuotas", "interes", "envio gratis" ]], { origin: "A1" });
      //   // const max_width = this.tablaFormateada.reduce((w, r) => Math.max(w, r.name.length), 10);
      //   // worksheet["!cols"] = [ { wch: max_width } ];
      //   XLSX.writeFile(workbook, busqueda + ".xlsx", { compression: true });
      // }
    }
})

</script>


<style>
.flex-inline {
    display: flex;
    justify-content: space-around;
    gap: 10px;
}
.flex-inline-between {
    display: flex;
    justify-content: space-between;
    gap: 10px;
}
.flex-inline-left {
    display: flex;
    justify-content: left;
    gap: 10px;
}

.gap {
    display: flex;
    gap: 5px;
}

.border {
  border: 1px solid black;
  border-radius: 5px;
  padding-inline: 1rem;
}

.mt-10 {
  margin-top: 10px;
}

.table-responsive {
    max-height: 450px;
}
</style>