<template>
    <div>

        <!---------------------------------------- FOMRULARIO Y DISPOSITIVOS ---------------------------------------->
        <div class="row">
        <!-------------------- Componente card equivalente a div en HTML -------------------->
            <card>

            <!---------- Encabezado de la ruta Devices ---------->
            <div slot="header">
                <h4 class = "card-title">Agregar nuevo dispositivo</h4>
            </div>
            <!--------------------------------------------------->

            <!---------- Columnas de la primera fila (inputs y selector) ---------->
            <div class="row">

                <div class="col-4">
                    <base-input 
                      label="Nombre del dispositivo" 
                      type="text"
                      v-model="newDevice.name"
                      >
                      </base-input>
                </div>

                <div class="col-4">
                    <base-input 
                      label="Número de serie"
                      type="text"
                      v-model="newDevice.dId"
                      >
                      </base-input>
                </div>

                <div class="col-4">
                    <slot name="label">
                        <label>Selección del tema</label>
                    </slot>

                    <el-select 
                      v-model="selectedIndexTemplate"
                      placeholder="Selección del tema:"
                      class="select-primary"
                      style="width:100%">

                        <el-option
                          v-for="(template, index) in templates"
                          :key="template._id"
                          class="text-dark"
                          :value="index"
                          :label="template.name"
                        ></el-option>

                    </el-select>
                </div>

            </div>
            <!--------------------------------------------------------------------->

            <!---------- Botón ubicado en la segunda fila ---------->
            <div class="row pull-right">
                <div class="col-12">
                    <base-button @click="createNewDevice()" type="blue" class="mb-3" size="lg">
                    Agregar dispositivo
                    </base-button>
                </div>
            </div>
            <!------------------------------------------------------>
            </card>
        <!----------------------------------------------------------------------------------->
        </div>
        <!----------------------------------------------------------------------------------------------------------->


        <!---------------------------------------- TABLA DE DISPOSITIVOS ---------------------------------------->
        <div class="row">
            <card>

            <!---------- Segundo encabezado de la ruta Devices ---------->
            <div slot="header">
                <h4 class = "card-title">Dispositivos</h4>
            </div>
            <!--------------------------------------------------->

            <!---------- Tabla de dispositivos ---------->
            <el-table :data="$store.state.devices">
                <el-table-column prop="name" label="Nombre"></el-table-column>
                <el-table-column prop="dId" label="Id"></el-table-column>
                <el-table-column prop="password" label="Clave"></el-table-column>
                <el-table-column prop="templateName" label="Plantilla"></el-table-column>

                <el-table-column label="Acciones">
                    <!--Extraemos el índice de cada fila-->
                    <div slot-scope="{row, $index}">

                        <el-tooltip
                          content="Saver Status Indicator"
                          style="margin-right:10px"
                        >
                          <i
                            class="fas fa-database "
                            :class="{
                              'text-success': row.saverRule.status,
                              'text-dark': !row.saverRule.status
                            }"
                          ></i>
                        </el-tooltip>

                        <el-tooltip content="Database Saver">
                            <base-switch
                            @click="updateSaverRuleStatus(row.saverRule)" 
                            :value="row.saverRule.status"
                            type="blue"
                            on-text="On"
                            off-text="Off">
                            </base-switch>

                        </el-tooltip>

                        <!--Contenedor de botones y elementos para tablas-->
                        <el-tooltip content="Delete" effect="Light" :open-delay="300" placement="top">
                            <base-button type="danger" icon size="sm" class="btn-link" @click="deleteDevice(row)">
                            <i class="tim-icons icon-simple-remove"></i>
                            </base-button>
                        </el-tooltip>

                    </div>
                    
                </el-table-column>
            
            
            </el-table>
            <!------------------------------------------->
            </card>
        </div>
        <!------------------------------------------------------------------------------------------------------->

<!-- dos puntos significa que es variable / Json es un componente que da color-->
        <Json :value="$store.state.selectedDevice"></Json>
        <Json :value="$store.state.devices"></Json>
    </div>
</template>

<!------------------------------ Importamos algunos componentes creados en Nuxt ------------------------------>
<script>
import { Table, TableColumn }from "element-ui";
import { Select, Option } from "element-ui";

export default{
  
  middleware: "authenticated",
  //---------- Llamamos a los componentes ----------
  components: {
      [Table.name]: Table,
      [TableColumn.name]: TableColumn,
      [Option.name]: Option,
      [Select.name]: Select,
  },

  //---------- Esta función devuelve un objeto que contiene nuestras variables ----------
  data(){
      return {
          templates:[],
          selectedIndexTemplate: null,
          newDevice: {
              name: "",
              dId: "",
              templateId: "",
              templateName: ""
          },
      };
  },

  mounted(){
      this.getTemplates();
  },

  methods: {

    updateSaverRuleStatus(rule) {
      
      // Hacemos una copia de la regla
      var ruleCopy = JSON.parse(JSON.stringify(rule));

      // Invertimos el estado de la copy-regla
      ruleCopy.status = !ruleCopy.status;

      const toSend = { 
        rule: ruleCopy
      };

      // Header
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      // Enviamos la nueva regla
      this.$axios
        .put("/saver-rule", toSend, axiosHeaders)
        .then(res => {

          // Si todo sale bien
          if (res.data.status == "success") {

            // Disparamos la acción
            this.$store.dispatch("getDevices");
          }

          return;
        })
        .catch(e => {
          console.log(e);
          return;
        });
    },

    deleteDevice(device) {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.accessToken
        },
        params: {
          dId: device.dId
        }
      };

      this.$axios
        .delete("/device", axiosHeaders)
        .then(res => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " deleted!"
            });
          }

          $nuxt.$emit("time-to-get-devices");

          return;
        })
        .catch(e => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: " Error deleting " + device.name
          });
          return;
        });
    },

    //----- CREAMOS NUEVO DISPOSITIVO -----
    createNewDevice() {
        // Verificamos si se ha puesto un nombre
        if (this.newDevice.name == "") {
          this.$notify({
            type: "warning",
            icon: "tim-icons icon-alert-circle-exc",
            message: "El nombre del dispositivo está vacío"
          });
          return; // Acabamos la función
        }

        if (this.newDevice.dId == "") {
          this.$notify({
            type: "warning",
            icon: "tim-icons icon-alert-circle-exc",
            message: "El Device ID está vacío"
          });
          return;
        }

        if (this.selectedIndexTemplate == null) {
          this.$notify({
            type: "warning",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Debes seleccionar una plantilla"
          });
          return;
        }

        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.token
          }
        };

      //ESCRIBIMOS EL NOMBRE Y EL ID DEL TEMPLATE SELECCIONADO EN EL OBJETO newDevice
      this.newDevice.templateId = this.templates[this.selectedIndexTemplate]._id;
      this.newDevice.templateName = this.templates[this.selectedIndexTemplate].name;

      const toSend = {
        newDevice: this.newDevice
      };

      this.$axios
        .post("/device", toSend, axiosHeaders)
        .then(res => {

          if (res.data.status == "success") {

            this.$store.dispatch("getDevices");

            this.newDevice.name = "";
            this.newDevice.dId = "";
            this.selectedIndexTemplate = null;

            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "¡El dispositivo fue agregado!"
            });

            return;
          }
        })
        .catch(e => {

          if (
            e.response.data.status == "error" &&
            e.response.data.error.errors.dId.kind == "unique"
          ) {
            this.$notify({
              type: "warning",
              icon: "tim-icons icon-alert-circle-exc",
              message:
                "El dispositivo ya está registrado en el sistema. Intenta con otro."
            });
            return;
          } else {
            this.showNotify("danger", "Error");
            return;
          }
        });
    },
      
    //GET TEMPLATES
    async getTemplates() {
        
        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.token // userId rescatado del token
          }
        };

        try {
          const res = await this.$axios.get("/template", axiosHeaders);
          console.log(res.data);

          if (res.data.status == "success") {
            this.templates = res.data.data; // Conseguimos los templates
          }
        } catch (error) {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error obteniendo la plantilla"
          });
          console.log(error);
          return;
        }
    },

    deleteDevice(device) {
        const axiosHeader = {
          headers: {
            token: this.$store.state.auth.token
          },
          params: {
            dId: device.dId
          }
        };

        this.$axios
          .delete("/device", axiosHeader)
          .then(res => {
            if (res.data.status == "success") {
              this.$notify({
                type: "success",
                icon: "tim-icons icon-check-2",
                message: device.name + " eliminado"
              });
              this.$store.dispatch("getDevices");
            }
          })
          .catch(e => {
            console.log(e);
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: " Error eliminando " + device.name
            });
          });
    },
  }
}
</script>
<!------------------------------------------------------------------------------------------------------------>