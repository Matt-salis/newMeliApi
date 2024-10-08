<template>
  <div class="container">
      <h2>Metricas de de busqueda por producto</h2>
      <div class="flex-inline">
        <input type="text" class="form-control" v-on:keyup.enter="buscarQuery()" v-model="queryBusqueda">
        <button :disabled="queryBusqueda == ''" class="btn btn-primary" @click="buscarQuery()">Buscar</button>
      </div>
      <div class="flex-inline-left" style="margin-top: 15px; margin-bottom: 5px;">
         <div class="flex-inline-left">
          <label for="festado">Estado del Item <input id="festado" type="checkbox" v-model="filtraEstado"></label>
          <div v-if="filtraEstado">
            <div class="gap">
              <input v-model="filtroEstado" value='2230284' type="radio" id="nuevo" name="estado" checked><br>
              <label for="nuevo">Nuevo</label>
            </div>
            <div class="gap">
              <input v-model="filtroEstado" value='2230581' type="radio" id="usado" name="estado"><br>
              <label for="usado">Usado</label>
            </div>
            <div class="gap">
              <input v-model="filtroEstado" value='2230582' type="radio" id="reacondicionado" name="estado">
              <label for="reacondicionado">Reacondicionado</label>
            </div>
          </div>
        </div>
         <div class="flex-inline-left">
          <label for="fcuotas">Cuotas <input id="fcuotas" type="checkbox" v-model="filtraCuotas"></label>
          <div v-if="filtraCuotas">
            <div class="gap">  
              <input v-model="filtroCuotas" value='yes' type="radio" id="interes" name="cuotas" checked><br>
              <label for="interes">Todos</label>
            </div>
            <div class="gap">
              <input v-model="filtroCuotas" value='no_interest' type="radio" id="nointeres" name="cuotas"><br>
              <label for="nointeres">Sin interes</label>
            </div>
          </div>
        </div>
         <div class="flex-inline-left">
          <label for="fenvios">Envio <input id="fenvios" type="checkbox" v-model="filtraEnvios"></label>
          <div v-if="filtraEnvios">
            <div class="gap">  
              <input v-model="filtroEnvios" value='free' type="radio" id="enviogratis" name="envio" checked><br>
              <label for="enviogratis">Envio gratis</label>
            </div>
            <div class="gap">
              <input v-model="filtroEnvios" value='' type="radio" id="enviopago" name="envio"><br>
              <label for="enviopago">Todos</label>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-inline-between" style="margin-top: 15px; margin-bottom: 5px;">
        <p v-if="results.length > 0">Cantidad: {{results.length}}</p>
        <button v-if="results.length > 0" @click="exportXlsx()" class="btn btn-outline-success">Exportar</button>
      </div>
      <div class="table-responsive" v-if="results.length > 0" style="margin-top: 20px;">
        <table id="tabla" class="table table-bordered">
          <thead>
            <tr>
                <th>img de portada</th>
                <th>titulo</th>
                <th>link de la publicacion</th>
                <!-- <th>link del vendedor</th> -->
                <th>nombre del vendedor</th>
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
            <tr v-for="(result, key) in results" :key="key">
              <td><img style="max-width: 100px; max-height: 100px;" :src='result.thumbnail' alt="logo"></td>
              <td>{{result.title}}</td>
              <td><a :href='result.permalink'>{{result.permalink}}</a></td>
              <!-- <td><a :href='result.seller.permalink'>{{result.seller.permalink}}</a></td> -->
              <td>{{result.seller.nickname != null ? result.seller.nickname : "-"}}</td>
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
import tokenService from '../service/tokenService'
import { read, utils, writeFile } from 'xlsx';

export default defineComponent({
  data() {
    return {
    queryBusqueda: '',
    queryBusquedaOG: '',
    code: '',
    results: [],
    resultsOG: [],
    precioAsc: false,
    vendidosAsc: false,
    eshopAsc: false,
    tablaFormateada: [],
    filtroCuotas: 'yes',
    filtraCuotas: false,
    filtroEstado: '2230284',
    filtraEstado: false,
    filtroEnvios: 'free',
    filtraEnvios: false
    }
  },
  mounted() {
    var token = window.localStorage.getItem('token')
    if (token == null) {
      this.checkParam()
    }
  },
  methods: {
      queryFiltros() {
        var query = ''
        if (this.filtraCuotas) {
          query = ('&installments=' + this.filtroCuotas);
        }
        if (this.filtraEstado) {
          query += ('&ITEM_CONDITION=' + this.filtroEstado);
        } 
        if (this.filtraEnvios && this.filtroEnvios != '') {
          query += ('&shipping_cost=' + this.filtroEnvios)
        }
        return query;
      },
      buscarQuery() {
        // var filtros = "&item_condition=2230284";
        var filtros = this.queryFiltros();
        this.tablaFormateada = []
        var token = window.localStorage.getItem('token')
        this.queryBusquedaOG = this.queryBusqueda
        var query = this.queryBusqueda.replaceAll(' ', '%20')
        $.ajax({
          type: "GET",
          url: "https://api.mercadolibre.com/sites/MLA/search?q=" + query + filtros,
          authorization: "Bearer " + token,
        }).then((res) => {
          var total = res.paging.total
          var max = Math.ceil(total / 50) - 1 
          // if (max >= 20) {
          //   max = 19
          // }
          this.results = res.results
          this.resultsOG = this.results

          var u = 1
          for (var i = 1; i <= max; i++) {
            $.ajax({
              type: "GET",
              url: "https://api.mercadolibre.com/sites/MLA/search?q=" + query + filtros + "&offset=" + (i * 50),
              authorization: "Bearer " + token,
            }).then((ans) => {
              this.results.push(...ans.results)
              this.resultsOG = this.results
              // if (this.results.length == total || this.results.length == 1000) {
              //   this.formatTable()
              // }
            }).catch((err) => {
              if (err.response.error == "invalid_grant") {
                tokenService.checkParam()
              }
              if (err.response.message == "Invalid token") {
                tokenService.refreshToken()
              }
              console.log(err)
            })
          }

        }).catch((err) => {
          if (err.response.error == "invalid_grant") {
            tokenService.checkParam()
          }
          if (err.response.message == "Invalid token") {
            tokenService.refreshToken()
          }
          console.log(err)
        })
      },
      formatTable() {
        this.results.forEach(x => {
          var json = {
            titulo: x.title,
            linkpubli: x.permalink,
            linkvendedor: x.seller.permalink,
            nombreeshop: x.seller.eshop != null ? x.seller.eshop.nick_name : '-',
            condicion: x.condition,
            precio: x.price,
            disponibles: x.available_quantity,
            vendidos: x.sold_quantity,
            cuotas: x.installments?.quantity ?? '-',
            intereses: x.installments?.rate ?? '-',
            envio: x.shipping.free_shipping
          }
          if (x.installments == null) {
            console.log(x)
          }
          this.tablaFormateada.push(json)
        });
      },
      exportXlsx() {
        this.formatTable()
        var busqueda = this.queryBusquedaOG.replaceAll(" ", "-")
        var worksheet = XLSX.utils.json_to_sheet(this.tablaFormateada)
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Publicaciones");
        XLSX.utils.sheet_add_aoa(worksheet, [[ "titulo", "link de la publicacion", "link del vendedor", "nombre del Eshop", "condicion", "precio", "cantidad disponible", "cantidad vendidos", "cuotas", "interes", "envio gratis" ]], { origin: "A1" });
        // const max_width = this.tablaFormateada.reduce((w, r) => Math.max(w, r.name.length), 10);
        // worksheet["!cols"] = [ { wch: max_width } ];
        XLSX.writeFile(workbook, busqueda + ".xlsx", { compression: true });
      }
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

.table-responsive {
    max-height: 500px;
}
</style>
