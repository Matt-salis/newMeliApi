<template>
    <div class="container mx-auto mt-5">
      <h1 class="text-2xl font-bold">Comparar precios de competidores</h1>
      <p>Aquí puedes ver el estado de las publicaciones de los competidores y actualizar los precios.</p>
      <button class="btn btn-outline-primary btn-sm py-2 px-4" @click="abrirInstrucciones">
        Instrucciones de uso
      </button>
      <!-- Nueva sección para buscar y agregar competidores -->
      <div class="mt-5"  v-if="!selectedCompetitor && !loading">
        <h2 class="text-xl">Buscar nuevo competidor:</h2>
        <div class="flex justify-center" style="display: flex;">
          <input type="text" v-model="searchQuery" placeholder="Ingresa el apodo del competidor" class="form-control border p-1 rounded" @change="searchCompetitor"/>
          <button class="btn btn-outline-primary btn-sm bg-blue-500 py-2 px-4 rounded hover:bg-blue-600" @click="searchCompetitor">
            Buscar
          </button>
        </div>
        <div v-if="searchResults.length > 0" class="mt-3">
          <h3 class="text-lg">Resultados de búsqueda:</h3>
          <ul>
            <li
              v-for="competitor in searchResults"
              :key="competitor.id"
              class="flex justify-between items-center border p-2"
            >
              <span>{{ competitor.nickname }}</span>
              <button
                class="btn btn-outline-primary btn-sm bg-green-500 py-1 px-2 rounded hover:bg-green-600"
                @click="confirmAddCompetitor(competitor)"
              >
                Confirmar
              </button>
            </li>
          </ul>
        </div>
      </div>
  
      <div class="mt-5" v-if="!selectedCompetitor && !loading">
        <h2 class="text-xl">Competidores:</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="competitor in competitors"
          :key="competitor.id" class="flex my-1 mx-2">
              <button
              class="btn btn-outline-primary btn-sm"
              @click="selectCompetitor(competitor)"
              
              >
              {{ competitor.name }}
            </button>
            <button @dblclick="borrarCompetidor(competitor, index)" class="btn btn-sm btn-danger w-10" :title="'borrar competidor ' + competitor.name">X</button>
          </div>
        </div>
      </div>
      
      <div v-if="selectedCompetitor" class="mt-5">
        <h3 class="text-xl">Comparando precios para: {{ selectedCompetitor.name }}</h3>
        <button 
          class="btn btn-outline-primary btn-sm bg-red-500 py-2 px-4 rounded hover:bg-red-600" 
          @click="unselectCompetitor"
        >
          Volver
        </button>
        <div class="mt-3">
          <button 
            class="btn btn-outline-primary btn-sm bg-green-500 py-2 px-4 rounded hover:bg-green-600" 
            @click="compareAndUpdateCompetitorPrices"
          >
            Actualizar precios cambiados en la base de datos
          </button>
          <div class="flex gap-2 m-2">
            <button 
              class="btn btn-outline-primary btn-sm bg-purple-500 py-2 px-4 rounded hover:bg-purple-600 ml-2" 
              @click="fetchRecentChanges"
            >
              Ver cambios recientes
            </button>
          </div>
        </div>
      </div>
        <div v-if="loading" style="width: 100%; justify-content: center;">
          <img style="width: 70px;" src="../assets/orange_circles.gif" alt="">
        </div>
        <div v-if="loading" class="mt-3">Cargando cambios recientes...</div>
        <div v-if="updateMessage" class="mt-3 text-green-500">{{ updateMessage }}</div>
  
        <div v-if="changedProducts.length > 0" class="mt-5" style="width: full;">
          <h4 class="text-lg font-semibold">Productos con cambios de precio: {{ changedProducts.length }}</h4>
          <button :disabled="loading" @click="exportXlsx()" class="btn btn-outline-success">Exportar</button>
          <table class="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Vendedor</th>
                <th>Precio anterior</th>
                <th>Precio actual MELI</th>
                <th>Variación</th>
                <th>Fecha de actualización</th>
                <th>Historial de precios</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, key) in changedProducts" :key="key">
                <td><img :src="product.imageUrl" alt="Imagen del producto" class="w-16 h-16 object-cover"></td>
                <td><a :href="product.link" target="_blank" class="text-blue-500 underline">{{ product.name }}</a></td>
                <td>{{ product.sellerName }}</td>
                <td><span class="line-through text-red-500">{{ product.firebasePrice ?? '-' }}</span></td>
                <td><span class="font-bold text-green-500">{{ product.currentPrice }}</span></td>
                <td><span class="font-bold text-green-500">%{{ (((product.currentPrice - product.firebasePrice) / product.firebasePrice) * 100).toFixed(2) }}</span></td>
                <td>{{ formatFecha(product.lastUpdated) }}</td>
                <td><button :disabled="loading" class="btn btn-sm btn-outline-success" @click="verHistorial(key)">historial</button></td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Botón para ver cambios de precio de todos los competidores -->
        <div v-if="!selectedCompetitor" class="mt-5 flex gap-2">
          <button :disabled="loading"
            class="btn btn-outline-primary btn-sm bg-yellow-500 py-2 px-4 rounded hover:bg-yellow-600 mx-2" 
            @click="fetchAllCompetitorsRecentChanges"
          >
            Ver cambios de precio de todos los competidores
          </button>
          <button :disabled="loading" class="btn btn-outline-primary btn-sm bg-blue-500 py-2 px-4 rounded hover:bg-blue-600" @click="changeAllPriceDifferences">
            Actualizar precios en todos los competidores
            </button>
        </div>


        <dialog id="instrucciones" class="dialog">
          <h2>Comparacion de precios vendedores</h2>
          <p style="text-wrap: balance;">La dinamica de esta herramienta consiste de comparar 
            periodicamente los precios de la publicaciones de determinados
            vendedores para poder evaluar las variaciones en los mismos
          </p>
          <p style="text-wrap: balance;">Para esto es necesario definir cuales seran los competidores 
            a rastrear y definir una norma de checkeo y actualizacion de 
            los precios.
          </p>
          <ul class="border">
            <li class="m-2">Ingresa el apodo del competidor en el campo de búsqueda.</li>
            <li class="m-2">Haz clic en el botón "Buscar" para encontrar al competidor.</li>
            <li class="m-2">Selecciona el competidor de la lista de resultados.</li>
            <li class="m-2">Para actualizar los precios, haz clic en el botón "Actualizar precios".</li>
            <li class="m-2">Haz clic en el botón "Comparar precios" para ver los precios cambiados de los productos del competidor.</li>
            <li class="m-2">Podes realizar la busqueda de todos los vendedores o de uno puntual por vez</li>
            <li class="m-2">Misma logica para actualizar los precios almacenados</li>
          </ul>
          <button class="btn btn-outline-danger btn-sm" @click="cerrarInstrucciones">Cerrar</button>
        </dialog>

        <dialog id="historial" class="dialog">
          <h2>Historial de precios de:</h2>
          <h3>{{ productoHistorial }}</h3>
          <div class="border" style="overflow-y: scroll;">
            <div v-for="historia in historial" style="display: flex; gap: 30px; justify-content: center;">
              <p>${{ historia.price }}</p>
              <p>{{ formatFecha(historia.priceDate) }}</p>
            </div>
          </div>
          <button class="btn btn-outline-danger btn-sm" @click="cerrarHistorial">Cerrar</button>
        </dialog>
        
        <!-- end ----------------------------- -->
    </div>
  </template>
  
  <script>
  
  export default {
    data() {
      return {
        backend: 'http://localhost:3000',
        competitors: [],
        selectedCompetitor: null,
        loading: false,
        updateMessage: '',
        changedProducts: [],
        searchQuery: '', // Nueva variable para almacenar la búsqueda
        searchResults: [],
        tablaFormateada: [], // Nueva variable para almacenar resultados de búsqueda
        userId: '',
        historial: [],
        productoHistorial: ''
      };
    },
    methods: {
      abrirInstrucciones() {
        document.getElementById('instrucciones').showModal();
      },
      cerrarInstrucciones() {
        document.getElementById('instrucciones').close();
      },
      cerrarHistorial() {
        document.getElementById('historial').close();
      },
      formatTable() {
        this.tablaFormateada = []
        this.changedProducts.forEach(x => {
          var json = {
            producto: x.name,
            link: x.link,
            vendedor: x.sellerName,
            precioViejo: x.firebasePrice,
            precioNuevo: x.currentPrice,
            fecha: this.formatFecha(x.lastUpdated)
          }
          if (x.installments == null) {
            console.log(x)
          }
          this.tablaFormateada.push(json)
        });
      },
      exportXlsx() {
        this.formatTable()
        var worksheet = XLSX.utils.json_to_sheet(this.tablaFormateada)
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Publicaciones");
        XLSX.utils.sheet_add_aoa(worksheet, [[ "Producto", "link de la publicacion", "Vendedor", "Precio anterior", "Precio Actual", "Fecha del ultimo precio" ]], { origin: "A1" });
        // const max_width = this.tablaFormateada.reduce((w, r) => Math.max(w, r.name.length), 10);
        // worksheet["!cols"] = [ { wch: max_width } ];
        XLSX.writeFile(workbook, "competencia.xlsx", { compression: true });
      },
      formatFecha(f) {
        const date = new Date(f);

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');


        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

        return formattedDate;
      },
      selectCompetitor(competitor) {
        this.selectedCompetitor = { id: competitor.id, name: competitor.name };
        this.updateMessage = ''; 
        this.changedProducts = []; 
      },
      unselectCompetitor() {
        this.selectedCompetitor = null;
        this.updateMessage = '';  
        this.changedProducts = []; 
      },
      async confirmAddCompetitor(competitor) {
        try {
          this.loading = true;
          this.updateMessage = ''
          
          // Call backend to add the selected competitor
          const response = await fetch(this.backend + '/api/' + this.userId + '/competitors/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: competitor.id, // The ID of the competitor to be added
              name: competitor.nickname, // Optional: the nickname of the competitor
            }),
          });

          
          await response;
          
          if (!response.ok) {
            console.log("error")
            throw new Error('Error adding competitor');
          }
          // Update the UI with the newly added competitor
          this.competitors.push({
            id: competitor.id, // Assuming the backend returns the ID of the competitor
            name: competitor.nickname, // Name or nickname of the competitor
          });
          
          this.searchResults = []; // Clear search results after adding
          this.searchQuery = ''; // Clear search input

          this.loading = false;
          this.updateMessage = 'Competidor añadido correctamente'
        } catch (error) {
          console.error('Error confirming competitor:', error);
          this.loading = false;
        }
      },
      async borrarCompetidor(competitor) {
        const response = await fetch(this.backend + '/api/' + this.userId + '/competitors/remove/' + competitor.id, {
            method: 'DELETE',
          });
        if (!response.ok) {
          throw new Error('Error removing competitor');
        }
        this.competitors = this.competitors.filter((item) => item.id !== competitor.id);
      },      
      async fetchCompetitors() {
        // Fetch all competitors from the backend
        this.competitors = await fetch(this.backend + '/api/' + this.userId + '/competitors').then(res => res.json()); // Replace Firebase collection call
      },
      async searchCompetitor() {
        this.loading = true;
        this.updateMessage = ''
        this.searchResults = []; 
  
        try {
          const url = `https://api.mercadolibre.com/sites/MLA/search?nickname=${this.searchQuery}`;
          const response = await fetch(url);
          const data = await response.json();
  
          if (data && data.seller) {
            this.searchResults.push({
                id: data.seller.id,
                nickname: data.seller.nickname,
            });
            
          } else {
            console.error('Error en la respuesta de búsqueda:', data);
          }
        } catch (error) {
          console.error('Error al buscar competidor:', error);
        }
  
        this.loading = false;
      },

      async verHistorial(index) {
        this.loading = true
        this.updateMessage = ''
        const product = this.changedProducts[index]
        console.log("ver historial de producto")
        console.log(product)
        const history = await fetch(`${this.backend}/api/${this.userId}/publications/${product.id}/history`).then(res => res.json()); // Replace Firebase nested collection call
        this.historial = history
        if (this.historial.length) {
          this.updateMessage = ''
          this.productoHistorial = product.name
          document.getElementById('historial').showModal();
        } else {
          this.updateMessage = 'No hay historial de registro de este item'
        }
        this.loading = false
      },

      // Busca los cambios de un competidor particular
      async fetchRecentChanges() {
        this.loading = true
        this.updateMessage = ''
        const currentPublications = await this.fetchPublications(this.selectedCompetitor.id);
        const storedPublications = await fetch(`${this.backend}/api/${this.userId}/competitors/${this.selectedCompetitor.id}/search`).then(res => res.json()); // Replace Firebase nested collection call
        this.changedProducts = []
        currentPublications.forEach(async publication => {
          const storedPublication = storedPublications.find(p => p.id === publication.id);

          if (storedPublication) {
            let price = publication.price;
            if (typeof price === 'string') {
              price = parseFloat(price); // Convert string to number if needed
            }
            if (typeof storedPublication === 'string') {
              storedPublication = parseFloat(price); // Convert string to number if needed
            }
            // Compare prices, considering possible floating point precision issues
            const EPSILON = 0.01; // Tolerance for price comparison
            if (Math.abs(storedPublication.price - price) > EPSILON) {
              console.log(publication)
              let product = {
                id: publication.id,
                link: publication.link,
                sellerName: publication.seller,
                imageUrl: publication.imageUrl,
                sellerName: publication.seller,
                name: publication.name,
                firebasePrice: storedPublication.price,
                currentPrice: price,
                lastUpdated: this.formatFecha(storedPublication.lastUpdate)
              }
              this.changedProducts.push(product)
            }
          } 
        })
        if (!this.changedProducts.length) {
          this.updateMessage = 'No se encontraron cambios de precios'
        }
        this.loading = false
      },
      // Busca todas las publicaciones en MELI de un competidor
      async fetchPublications(sellerId) {
        // Fetch current publications from MELI API (this remains the same)
        const limit = 50;
        let offset = 0;
        let totalFetched = 0;
        const allPublications = [];

        while (totalFetched < 1000) {
          const url = `https://api.mercadolibre.com/sites/MLA/search?seller_id=${sellerId}&limit=${limit}&offset=${offset}`;
          const response = await fetch(url);
          const data = await response.json();

          if (data && Array.isArray(data.results)) {
            if (data.results.length === 0) break;
            totalFetched += data.results.length;

            data.results.forEach(item => {
              allPublications.push({
                id: item.id,
                name: item.title,
                price: item.price,
                imageUrl: item.thumbnail,
                link: item.permalink,
                seller: data.seller.nickname
              });
            });

            offset += limit;
          } else {
            console.error('Error in API response:', data);
            break;
          }
        }

        return allPublications;
      },
      // Guarda una publicacion de un competidor
      async savePublication(sellerId, publication) {
        // Save publication via the backend API
        await fetch(`${this.backend}/api/${this.userId}/competitors/${sellerId}/publications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: '/',
          },
          body: JSON.stringify({
            id: publication.id,
            name: publication.name,
            price: publication.price,
            lastUpdated: new Date(),
          })
        }); // Replace Firebase setDoc
      },
      // Guarda los precios cambiados de un competidor
      async compareAndUpdateCompetitorPrices() {
        this.loading = true;
        this.updateMessage = ''; 

        try {
          // Fetch stored publications from the backend
          // const storedPublications = await fetch(`${this.backend}/api/competitors/${this.selectedCompetitor.id}/publications`).then(res => res.json()); // Replace Firebase getDocs

          const currentPublications = await this.fetchPublications(this.selectedCompetitor.id);

          currentPublications.forEach(publication => {
              this.savePublication(this.selectedCompetitor.id, publication);
          });

          this.updateMessage = 'Precios actualizados en la base de datos.';
        } catch (error) {
          console.error('Error comparing and updating prices:', error);
          this.updateMessage = 'Hubo un error al comparar y actualizar precios.';
        }

        this.loading = false;
      },
      // Guarda todos los cambios de los competidores del usuario
      async changeAllPriceDifferences() {
        this.loading = true;
        this.updateMessage = '';
        this.updateMessage = '';
        let allChangedProducts = 0;

        try {
          // Fetch all competitors from the backend
          const competitors = await fetch(this.backend + '/api/'+this.userId+'/competitors').then(res => res.json()); // Replace Firebase collection call
          
          for (const competitor of competitors) {
            // Fetch stored publications from the backend
            const storedPublications = await fetch(`${this.backend}/api/${this.userId}/competitors/${competitor.id}/publications`).then(res => res.json()); // Replace Firebase nested collection call
            
            // Fetch current publications from MELI API
            const currentPublications = await this.fetchPublications(competitor.id);

            let changedProducts = 0;

            currentPublications.forEach(async publication => {
              const storedPublication = storedPublications.find(p => p.id === publication.id);

              // if (storedPublication) {
              //   if (storedPublication.price !== publication.price) {
              //     // Update publication via the backend API
              //     await fetch(`${this.backend}/api/${this.userId}/competitors/${competitor.id}/publications/${publication.id}`, {
              //       method: 'PUT',
              //       headers: {
              //         'Content-Type': 'application/json',
              //       },
              //       body: JSON.stringify({ price: publication.price, lastUpdated: new Date() })
              //     }); // Replace Firebase updateDoc

              //     changedProducts++
              //   }
              // } else {
                // Add new publication via the backend API
                await fetch(`${this.backend}/api/${this.userId}/competitors/${competitor.id}/publications`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    id: publication.id,
                    name: publication.name,
                    price: publication.price,
                    lastUpdated: new Date(),
                  })
                }); // Replace Firebase setDoc

                changedProducts++
              // }
            });

              allChangedProducts += changedProducts;
          }
          this.updateMessage = allChangedProducts.length > 0 ? (allChangedProducts + ' Precios actualizados correctamente') : '';
        } catch (error) {
          console.error('Error updating prices for all competitors:', error);
          this.updateMessage = 'Error al actualizar los precios';
        } finally {
          this.loading = false;
        }
      },
      // Busca todos los precios cambiados de todos los competidores del usuario
      async fetchAllCompetitorsRecentChanges() {
        this.loading = true;
        this.updateMessage = ''
        // Fetch recent price changes for all competitors via the backend API
        this.changedProducts = []
        
        for (const competitor of this.competitors) {
          // Fetch stored publications from the backend
          const storedPublications = await fetch(`${this.backend}/api/${this.userId}/competitors/${competitor.id}/publications`).then(res => res.json()); // Replace Firebase nested collection call
          
          // Fetch current publications from MELI API
          const currentPublications = await this.fetchPublications(competitor.id);

          currentPublications.forEach(async publication => {
            const storedPublication = storedPublications.find(p => p.id === publication.id);

            if (storedPublication) {
              let price = publication.price;
              if (typeof storedPublication === 'string') {
                storedPublication = parseFloat(price); // Convert string to number if needed
              }
              // Compare prices, considering possible floating point precision issues
              const EPSILON = 0.01; // Tolerance for price comparison
              if (Math.abs(storedPublication.price - price) > EPSILON) {
                console.log(publication)
                let product = {
                  id: publication.id,
                  link: publication.link,
                  sellerName: publication.seller,
                  imageUrl: publication.imageUrl,
                  sellerName: publication.seller,
                  name: publication.name,
                  firebasePrice: storedPublication.price,
                  currentPrice: price,
                  lastUpdated: this.formatFecha(storedPublication.lastUpdate)
                }
                this.changedProducts.push(product)
              }
            } 
          })
        }
        if (!this.changedProducts.length) {
          this.updateMessage = 'No se encontraron cambios de precios'
        }
        this.loading = false;
      }
    },
      
    created() {
      const token = localStorage.getItem("token")
      this.userId = token.split('-').pop()
      this.fetchCompetitors();
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 80vw;
  }

  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 80%; /* Ajusta el ancho del diálogo */
  }

  .dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }
  </style>
  