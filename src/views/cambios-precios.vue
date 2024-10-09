<template>
    <div class="container mx-auto mt-5">
      <h1 class="text-2xl font-bold">Comparar precios de competidores</h1>
      <p>Aquí puedes ver el estado de las publicaciones de los competidores y actualizar los precios.</p>
  
      <!-- Nueva sección para buscar y agregar competidores -->
      <div class="mt-5"  v-if="!selectedCompetitor && !loading">
        <h2 class="text-xl">Buscar nuevo competidor:</h2>
        <div class="flex">
          <input
          type="text"
          v-model="searchQuery"
          placeholder="Ingresa el apodo del competidor"
          class="form-control w-44 border p-1 rounded"
          @change="searchCompetitor"
          />
          <button
          class="btn btn-outline-primary btn-sm bg-blue-500 py-2 px-4 rounded hover:bg-blue-600"
          @click="searchCompetitor"
          >
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
  
      <div class="mt-5">
        <h2 class="text-xl">Competidores:</h2>
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="competitor in competitors"
            :key="competitor.id"
            class="btn btn-outline-primary btn-sm bg-blue-500 py-1 px-2 rounded hover:bg-blue-600"
            @click="selectCompetitor(competitor)"
            v-if="!selectedCompetitor && !loading"
          >
            {{ competitor.name }}
          </button>
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
            @click="compareAndUpdatePrices"
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
        <div v-if="loading" class="mt-3">Cargando cambios recientes...</div>
        <div v-if="updateMessage" class="mt-3 text-green-500">{{ updateMessage }}</div>
        <div v-if="noChangesMessage" class="mt-3 text-red-500">{{ noChangesMessage }}</div>
  
        <div v-if="changedProducts.length > 0" class="mt-5">
          <h4 class="text-lg font-semibold">Productos con cambios de precio: {{ changedProducts.length }}</h4>
          <button :disabled="loading" @click="exportXlsx()" class="btn btn-outline-success">Exportar</button>
          <div class="overflow-scroll" style="height: 50vh;">
            <ul>
              <li v-for="product in changedProducts" :key="product.id" class="border p-2">
                <img :src="product.imageUrl" alt="Imagen del producto" class="w-16 h-16 object-cover" />
                <a :href="product.link" target="_blank" class="text-blue-500 underline">{{ product.name }}</a>
                <br>
                (Vendedor: {{ product.sellerName }}):
                <br>
                Precio guardado:
                <span class="line-through text-red-500">{{ product.firebasePrice ?? '-'  }}</span>
                <br>
                Precio actual MELI:
                <span class="font-bold text-green-500">{{ product.currentPrice }}</span>
                <br>
                Variacion:
                <span class="font-bold text-green-500">%{{ (((product.currentPrice - product.firebasePrice) / product.firebasePrice) * 100).toFixed(2) }}</span>
                <br>
                Fecha guardado en base de datos:
                <span class="text-gray-500">{{ formatFecha(product.lastUpdated) }}</span>
              </li>
            </ul>
          </div>
        </div>
  
        <!-- Botón para ver cambios de precio de todos los competidores -->
        <div v-if="!selectedCompetitor" class="mt-5 flex gap-2">
          <button :disabled="loading"
            class="btn btn-outline-primary btn-sm bg-yellow-500 py-2 px-4 rounded hover:bg-yellow-600 mx-2" 
            @click="fetchAllRecentChanges"
          >
            Ver cambios de precio de todos los competidores
          </button>
          <button :disabled="loading" class="btn btn-outline-primary btn-sm bg-blue-500 py-2 px-4 rounded hover:bg-blue-600" @click="checkAllPriceDifferences">
            Actualizar precios en todos los competidores
            </button>
        </div>
    </div>
  </template>
  
  <script>
  import { writeBatch } from 'firebase/firestore';
import { db, doc, getDoc, getDocs, collection, setDoc, updateDoc, arrayUnion } from '../firebase';
  
  export default {
    data() {
      return {
        competitors: [],
        selectedCompetitor: null,
        loading: false,
        updateMessage: '',
        noChangesMessage: '',
        changedProducts: [],
        searchQuery: '', // Nueva variable para almacenar la búsqueda
        searchResults: [],
        tablaFormateada: [] // Nueva variable para almacenar resultados de búsqueda
      };
    },
    methods: {
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

          const formattedDate = `${month}/${day}/${year}`;

          return formattedDate
        },
        async checkAllPriceDifferences() {
          this.loading = true;
          this.updateMessage = '';
          this.noChangesMessage = '';
          const allChangedProducts = []; // Array to store all changed products for UI updates

          try {
            // Fetch all competitors
            const competitorsSnapshot = await getDocs(collection(db, 'competitors'));
            const competitors = competitorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Loop through each competitor
            for (const competitor of competitors) {
              const storedPublicationsSnapshot = await getDocs(collection(db, 'competitors', competitor.id, 'publications'));
              const storedPublications = storedPublicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

              // Fetch current publications from MELI API for this competitor
              const currentPublications = await this.fetchPublications(competitor.id);

              // Prepare a batch operation for updates
              const batch = writeBatch(db);
              const changedProducts = []; // Track changes for this competitor

              // Check current publications against stored publications
              currentPublications.forEach(publication => {
                const storedPublication = storedPublications.find(p => p.id === publication.id);

                if (storedPublication) {
                  // If the price has changed
                  if (storedPublication.price !== publication.price) {
                    console.log(`Precio actualizado para el producto ${publication.name}`);
                    const publicationRef = doc(db, 'competitors', competitor.id, 'publications', publication.id);
                    batch.update(publicationRef, {
                      price: publication.price,
                      lastUpdated: new Date(),
                      history: arrayUnion({
                        price: publication.price,
                        date: new Date(),
                      }),
                    });

                    // Store information for UI
                    changedProducts.push({
                      id: publication.id,
                      name: publication.name,
                      firebasePrice: storedPublication.price,
                      currentPrice: publication.price,
                      lastUpdated: new Date(),
                      sellerName: competitor.name,
                      imageUrl: publication.imageUrl,
                      link: publication.link,
                    });
                  }
                } else {
                  // If it's a new publication
                  const publicationRef = doc(db, 'competitors', competitor.id, 'publications', publication.id);
                  batch.set(publicationRef, {
                    name: publication.name,
                    price: publication.price,
                    lastUpdated: new Date(),
                    history: [{ price: publication.price, date: new Date() }],
                  });

                  // Store information for UI
                  changedProducts.push({
                    id: publication.id,
                    name: publication.name,
                    firebasePrice: 0, // No previous price
                    currentPrice: publication.price,
                    lastUpdated: new Date(),
                    sellerName: competitor.name,
                    imageUrl: publication.imageUrl,
                    link: publication.link,
                  });
                }
              });

              // Commit the batch for this competitor
              if (changedProducts.length > 0) {
                await batch.commit();
                allChangedProducts.push(...changedProducts); // Collect all changes for UI
              }
            }

            // Update UI state
            this.changedProducts = allChangedProducts;
            this.updateMessage = allChangedProducts.length > 0 ? 'Precios actualizados correctamente' : 'No se encontraron cambios en los precios.';
          } catch (error) {
            console.error('Error updating prices for all competitors:', error);
            this.noChangesMessage = 'Error al actualizar los precios';
          } finally {
            this.loading = false;
          }
        },
      async fetchCompetitors() {
        const competitorsSnapshot = await getDocs(collection(db, 'competitors'));
        this.competitors = competitorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
  
      selectCompetitor(competitor) {
        this.selectedCompetitor = { id: competitor.id, name: competitor.name };
        this.updateMessage = ''; 
        this.noChangesMessage = ''; 
        this.changedProducts = []; 
      },
  
      unselectCompetitor() {
        this.selectedCompetitor = null;
        this.updateMessage = ''; 
        this.noChangesMessage = ''; 
        this.changedProducts = []; 
      },
  
      async fetchPublications(sellerId) {
        const limit = 50;
        let offset = 0;
        let totalFetched = 0;
  
        const allPublications = [];
  
        while (totalFetched < 1000) {
          const url = `https://api.mercadolibre.com/sites/MLA/search?seller_id=${sellerId}&limit=${limit}&offset=${offset}`;
          const response = await fetch(url);
          const data = await response.json();
  
          // Validar que la respuesta de la API sea válida
          if (data && Array.isArray(data.results)) {
            if (data.results.length === 0) break;
  
            totalFetched += data.results.length;
  
            data.results.forEach(item => {
              allPublications.push({
                id: item.id,
                name: item.title,
                price: item.price,
                imageUrl: item.thumbnail, // Añade la URL de la imagen
                link: item.permalink, // Añade el enlace de la publicación
              });
            });
  
            offset += limit;
          } else {
            console.error('Error en la respuesta de la API:', data);
            break; // Salir si la respuesta es inválida
          }
        }
  
        return allPublications;
      },
  
      async savePublication(sellerId, publication) {
        const publicationRef = doc(db, 'competitors', sellerId, 'publications', publication.id);
        const docSnapshot = await getDoc(publicationRef);
        const currentPrice = publication.price;
  
        if (docSnapshot.exists()) {
          const existingData = docSnapshot.data();
          if (existingData.price !== currentPrice) {
            await updateDoc(publicationRef, {
              price: currentPrice,
              lastUpdated: new Date(),
              history: arrayUnion({
                price: currentPrice,
                date: new Date(),
              }),
            });
          }
        } else {
          await setDoc(publicationRef, {
            name: publication.name,
            price: currentPrice,
            lastUpdated: new Date(),
            history: [{ price: currentPrice, date: new Date() }],
          });
        }
      },
  
      async compareAndUpdatePrices() {
        this.loading = true;
        this.updateMessage = ''; 
  
        try {
          const storedPublicationsSnapshot = await getDocs(collection(db, 'competitors', this.selectedCompetitor.id, 'publications'));
          const storedPublications = [];
          storedPublicationsSnapshot.forEach(doc => storedPublications.push({ id: doc.id, ...doc.data() }));
  
          const currentPublications = await this.fetchPublications(this.selectedCompetitor.id);
  
          currentPublications.forEach(publication => {
            const storedPublication = storedPublications.find(p => p.id === publication.id);
  
            if (!storedPublication || storedPublication.price !== publication.price) {
              console.log(`Precio actualizado para el producto ${publication.name}`);
              this.savePublication(this.selectedCompetitor.id, publication);
            }
          });
  
          this.updateMessage = 'Precios actualizados en la base de datos.';
        } catch (error) {
          console.error('Error al comparar y actualizar precios:', error);
          this.updateMessage = 'Hubo un error al comparar y actualizar precios.';
        }
  
        this.loading = false;
      },
  
      async searchCompetitor() {
        this.loading = true;
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
  
      async confirmAddCompetitor(competitor) {
        const competitorRef = doc(db, 'competitors', competitor.id.toString());
        await setDoc(competitorRef, { name: competitor.nickname });
        this.fetchCompetitors(); // Actualiza la lista de competidores
        this.searchResults = []; // Limpia los resultados de búsqueda
      },
  
      async fetchRecentChanges() {
        this.loading = true;
        this.changedProducts = []; 
  
        try {
          const currentPublications = await this.fetchPublications(this.selectedCompetitor.id);
          const storedPublicationsSnapshot = await getDocs(collection(db, 'competitors', this.selectedCompetitor.id, 'publications'));
          const storedPublications = [];
          storedPublicationsSnapshot.forEach(doc => storedPublications.push({ id: doc.id, ...doc.data() }));
  
          currentPublications.forEach(publication => {
            const storedPublication = storedPublications.find(p => p.id === publication.id);
  
            if (storedPublication && storedPublication.price !== publication.price) {
              this.changedProducts.push({
                id: publication.id,
                name: publication.name,
                sellerName: this.selectedCompetitor.name,
                firebasePrice: storedPublication.price,
                currentPrice: publication.price,
                lastUpdated: storedPublication.lastUpdated.toDate().toLocaleString(),
                imageUrl: publication.imageUrl,
                link: publication.link,
              });
            }
          });
  
          if (this.changedProducts.length === 0) {
            this.noChangesMessage = 'No hay cambios recientes en los precios.';
          }
        } catch (error) {
          console.error('Error al buscar cambios recientes:', error);
          this.noChangesMessage = 'Hubo un error al buscar cambios recientes.';
        }
  
        this.loading = false;
      },
  
      async fetchAllRecentChanges() {
        this.loading = true;
        this.changedProducts = []; 
  
        try {
          for (const competitor of this.competitors) {
            const currentPublications = await this.fetchPublications(competitor.id);
            
            const storedPublicationsSnapshot = await getDocs(collection(db, 'competitors', competitor.id, 'publications'));
            const storedPublications = [];
            storedPublicationsSnapshot.forEach(doc => storedPublications.push({ id: doc.id, ...doc.data() }));
  
            currentPublications.forEach(publication => {
              const storedPublication = storedPublications.find(p => p.id === publication.id);
  
              if (storedPublication && storedPublication.price !== publication.price) {
                this.changedProducts.push({
                  id: publication.id,
                  name: publication.name,
                  sellerName: competitor.name,
                  firebasePrice: storedPublication.price,
                  currentPrice: publication.price,
                  lastUpdated: storedPublication.lastUpdated.toDate().toLocaleString(),
                  imageUrl: publication.imageUrl,
                  link: publication.link,
                });
              }
            });
          }
        } catch (error) {
          console.error('Error al buscar cambios recientes:', error);
        }
  
        this.loading = false;
      }
    },
  
    created() {
      this.fetchCompetitors();
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
  }
  </style>
  