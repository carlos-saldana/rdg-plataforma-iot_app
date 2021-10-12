<template>
  <div>

    <!-------------------------------------------------------------------------------------------------------------->
    <!---------------------------------------- CONFIGURADOR DE DISPOSITIVOS ---------------------------------------->
    <!-------------------------------------------------------------------------------------------------------------->
    <div class="row">
      <card>

        <div slot="header">
          <h4 class="card-title">Dispositivos</h4>
        </div>

        <div class="row">
          <!---------- SELECTOR DE DISPOSITIVOS Y FORMULARIO ---------->
          <div class="col-6">
            <!---------- SELECTOR DE DISPOSITIVOS ---------->
            <el-select
              v-model="widgetType"
              class="select-success"
              placeholder="Select Widget"
              style="width: 100%;"
            >

              <el-option
                class="text-dark"
                value="numberchart"
                label="Gráfica de datos"
              ></el-option>

              <el-option
                class="text-dark"
                value="indicator"
                label="Indicador booleano"
              ></el-option>

              <el-option
                class="text-dark"
                value="switch"
                label="Switch"
              ></el-option>

              <el-option
                class="text-dark"
                value="button"
                label="Button"
              ></el-option>
            </el-select>
            <!---------------------------------------------->

            <br />
            <br />

            <!---------- FORMULARIO PARA LA GRÁFICA DE DATOS ---------->
            <div v-if="widgetType == 'numberchart'">

              <!----- Nombre de la variable ----->
              <base-input
                v-model="ncConfig.variableFullName"
                label="Nombre de la variable"
                type="text"
              ></base-input>
              <!--------------------------------->

              <!----- Unidades de la variable ----->
              <base-input v-model="ncConfig.unit" label="Unidades" type="text">
              </base-input>
              <!----------------------------------->

              <!----- Número de decimales ----->
              <base-input
                v-model.number="ncConfig.decimalPlaces"
                label="Número de decimales"
                type="number"
              >
              </base-input>
              <!------------------------------->

              <!----- Icono del dispositivo ----->
              <base-input
                v-model="ncConfig.icon"
                label="Icono"
                type="text"
              ></base-input>
              <!--------------------------------->

              <br />

              <!----- Tiempo de retroceso del gráfico ----->
              <base-input
                v-model.number="ncConfig.chartTimeAgo"
                label="Dinámica del gráfico (min)"
                type="number"
              ></base-input>
              <!------------------------------------------->

              <br />

              <!----- Diseño del dispositivo ----->
              <el-select
                v-model="ncConfig.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%;">

                <el-option
                  class="text-success"
                  value="success"
                  label="Success"
                ></el-option>

                <el-option
                  class="text-primary"
                  value="primary"
                  label="Primary"
                ></el-option>

                <el-option
                  class="text-warning"
                  value="warning"
                  label="Warning"
                ></el-option>

                <el-option
                  class="text-danger"
                  value="danger"
                  label="Danger"
                ></el-option>

              </el-select>
              <!---------------------------------->

              <br /><br /><br />

              <!----- Espaceado del dispositivo ----->
              <el-select
                v-model="ncConfig.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%;">

                <el-option
                  class="text-dark"
                  value="col-3"
                  label="4 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-4"
                  label="3 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-6"
                  label="2 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-12"
                  label="1 en fila"
                ></el-option>

              </el-select>
              <!------------------------------------->

              <br /><br />
            </div>
            <!--------------------------------------------------------->

            <!---------- FORMULARIO PARA LA GRÁFICA DEL SWITCH ---------->
            <div v-if="widgetType == 'switch'">

              <!----- Nombre de la variable ----->
              <base-input
                v-model="iotSwitchConfig.variableFullName"
                label="Nombre de la variable"
                type="text"
              ></base-input>
              <!--------------------------------->

              <!----- Icono del dispositivo ----->
              <base-input
                v-model="iotSwitchConfig.icon"
                label="Icono"
                type="text"
              ></base-input>
              <!--------------------------------->

              <br />

              <!----- Diseño del dispositivo ----->
              <el-select
                v-model="iotSwitchConfig.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%;"
              >

                <el-option
                  class="text-success"
                  value="success"
                  label="Success"
                ></el-option>

                <el-option
                  class="text-primary"
                  value="primary"
                  label="Primary"
                ></el-option>

                <el-option
                  class="text-warning"
                  value="warning"
                  label="Warning"
                ></el-option>

                <el-option
                  class="text-danger"
                  value="danger"
                  label="Danger"
                ></el-option>

              </el-select>
              <!---------------------------------->

              <br /><br /><br />

              <!----- Espaceado del dispositivo ----->
              <el-select
                v-model="iotSwitchConfig.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%;">

                <el-option
                  class="text-dark"
                  value="col-3"
                  label="4 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-4"
                  label="3 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-6"
                  label="2 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-12"
                  label="1 en fila"
                ></el-option>

              </el-select>
              <!------------------------------------->
              <br /><br />
            </div>
            <!----------------------------------------------------------->

            <!---------- FORMULARIO PARA LA GRÁFICA DEL BOTÓN ---------->
            <div v-if="widgetType == 'button'">
              <base-input
                v-model="configButton.variableFullName"
                label="Nombre de la variable"
                type="text"
              >
              </base-input>

              <base-input
                v-model="configButton.message"
                label="Mensaje a enviar"
                type="text"
              >
              </base-input>

              <base-input
                v-model="configButton.text"
                label="Texto"
                type="text"
              >
              </base-input>

              <base-input
                v-model="configButton.icon"
                label="Icono"
                type="text"
              ></base-input>

              <br />

              <el-select
                v-model="configButton.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%;"
              >
                <el-option
                  class="text-success"
                  value="success"
                  label="Success"
                ></el-option>
                <el-option
                  class="text-primary"
                  value="primary"
                  label="Primary"
                ></el-option>
                <el-option
                  class="text-warning"
                  value="warning"
                  label="Warning"
                ></el-option>
                <el-option
                  class="text-danger"
                  value="danger"
                  label="Danger"
                ></el-option>
              </el-select>

              <br /><br /><br />

              <!----- Espaceado del dispositivo ----->
              <el-select
                v-model="configButton.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%;">

                <el-option
                  class="text-dark"
                  value="col-3"
                  label="4 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-4"
                  label="3 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-6"
                  label="2 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-12"
                  label="1 en fila"
                ></el-option>

              </el-select>
              <!------------------------------------->

              <br /><br />
            </div>
            <!---------------------------------------------------------->

            <!---------- FORMULARIO PARA EL INDICADOR BOOLEANO ---------->
            <div v-if="widgetType == 'indicator'">
              <base-input
                v-model="iotIndicatorConfig.variableFullName"
                label="Nombre de la variable"
                type="text"
              >
              </base-input>

              <base-input
                v-model="iotIndicatorConfig.icon"
                label="Icono"
                type="text"
              ></base-input>

              <base-input
                v-model="iotIndicatorConfig.variableSendFreq"
                label="Frecuencia de datos"
                type="text"
              ></base-input>

              <br />

              <el-select
                v-model="iotIndicatorConfig.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%;"
              >
                <el-option
                  class="text-success"
                  value="success"
                  label="Success"
                ></el-option>
                <el-option
                  class="text-primary"
                  value="primary"
                  label="Primary"
                ></el-option>
                <el-option
                  class="text-warning"
                  value="warning"
                  label="Warning"
                ></el-option>
                <el-option
                  class="text-danger"
                  value="danger"
                  label="Danger"
                ></el-option>
              </el-select>

              <br /><br /><br />

              <!----- Espaceado del dispositivo ----->
              <el-select
                v-model="iotIndicatorConfig.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%;">

                <el-option
                  class="text-dark"
                  value="col-3"
                  label="4 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-4"
                  label="3 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-6"
                  label="2 en fila"
                ></el-option>

                <el-option
                  class="text-dark"
                  value="col-12"
                  label="1 en fila"
                ></el-option>

              </el-select>
              <!------------------------------------->

              <br /><br />
            </div>
            <!----------------------------------------------------------->
          </div>

          <!---------- PREVISUALIZACIÓN DEL WIDGET ---------->
          <div class="col-6">
            <Rtnumberchart
              v-if="widgetType == 'numberchart'"
              :config="ncConfig"
            ></Rtnumberchart>
            <Iotswitch
              v-if="widgetType == 'switch'"
              :config="iotSwitchConfig"
            ></Iotswitch>
            <Iotbutton
              v-if="widgetType == 'button'"
              :config="configButton"
            ></Iotbutton>
            <Iotindicator
              v-if="widgetType == 'indicator'"
              :config="iotIndicatorConfig"
            ></Iotindicator>
          </div>
          <!------------------------------------------------->
        </div>

        <!---------- AGREGAMOS EL WIDGET ---------->
        <div class="row pull-right">
          <div class="col-12">
            <base-button
              native-type="submit"
              type="blue"
              class="mb-3"
              size="lg"
              @click="addNewWidget()">
              Agregar Widget
            </base-button>
          </div>
        </div>
        <!---------------------------------------------->

      </card>
    </div>
    <!-------------------------------------------------------------------------------------------------------------->
    <!-------------------------------------------------------------------------------------------------------------->
    <!-------------------------------------------------------------------------------------------------------------->



    <!---------------------------------------------------------------------------------------------------------------->
    <!---------------------------------------- PREVISUALIZACIÓN DEL DASHBOARD ---------------------------------------->
    <!---------------------------------------------------------------------------------------------------------------->
    <div class="row">

      <!----- Recorremos widget por widget ----->
      <div
        v-for="(widget, index) in widgets"
        :key="index"
        :class="[widget.column]">
      <!---------------------------------------->

        <!----- Botón para eliminar widgets ----->
        <i
          aria-hidden="true"
          class="fa fa-trash text-warning pull-right"
          @click="deleteWidget(index)"
          style="margin-bottom: 10px;"></i>
        <!--------------------------------------->

        <!---------- DECLARAMOS LOS COMPONENTES PARA LOS WIDGETS ---------->
        <!----- v-if permite mostrar el widget correspondiente ----->
        <Rtnumberchart
          v-if="widget.widget == 'numberchart'"
          :config="widget"
        ></Rtnumberchart>

        <Iotswitch
          v-if="widget.widget == 'switch'"
          :config="widget"
        ></Iotswitch>

        <Iotbutton
          v-if="widget.widget == 'button'"
          :config="widget"
        ></Iotbutton>

        <Iotindicator
          v-if="widget.widget == 'indicator'"
          :config="widget"
        ></Iotindicator>
        <!----------------------------------------------------------------->

      </div>
    </div>
    <!---------------------------------------------------------------------------------------------------------------->
    <!---------------------------------------------------------------------------------------------------------------->
    <!---------------------------------------------------------------------------------------------------------------->



    <!-------------------------------------------------------------------------------------------------------->
    <!---------------------------------------- GUARDAMOS LA PLANTILLA ---------------------------------------->
    <!-------------------------------------------------------------------------------------------------------->
    <div class="row"> 
      <card>

        <!----- Encabezado ----->
        <div slot="header">
          <h4 class="card-title">Plantilla</h4>
        </div>
        <!---------------------->

        <!----- Columnas de la tabla ----->
        <div class="row">
          <base-input
            class="col-4"
            v-model="templateName"
            label="Nombre"
            type="text"
          ></base-input>

          <base-input
            class="col-8"
            v-model="templateDescription"
            label="Descripción"
            type="text"
          ></base-input>
        </div>
        <!-------------------------------->

        <br /><br />

        <!----- Botón para guardar la plantilla ----->
        <div class="row">
          <div class="col-12">
            <base-button
              native-type="submit"
              type="blue"
              class="mb-3 pull-right"
              size="lg"
              @click="saveTemplate()"
              :disabled="widgets.length == 0">
              Guardar plantilla
            </base-button>
          </div>
        </div>
        <!------------------------------------------->

      </card>
    </div>
    <!-------------------------------------------------------------------------------------------------------->
    <!-------------------------------------------------------------------------------------------------------->
    <!-------------------------------------------------------------------------------------------------------->



    <!------------------------------------------------------------------------------------------------------------------>
    <!---------------------------------------- TABLA CON LAS PLANTILLAS CREADAS ---------------------------------------->
    <!------------------------------------------------------------------------------------------------------------------>
    <div class="row">
      <card>

        <!----- Encabezado ----->
        <div slot="header">
          <h4 class="card-title">Plantillas creadas</h4>
        </div>
        <!---------------------->

        <div class="row">

          <!----- Tabla con las plantillas creadas ----->
          <el-table :data="templates"> <!--Pasamos la variable local templates-->

            <el-table-column prop="name" label="Nombre"></el-table-column>

            <el-table-column
              prop="description"
              label="Descripción"
            ></el-table-column>

            <el-table-column
              prop="widgets.length"
              label="Widgets"
            ></el-table-column>

            <el-table-column header-align="center" align="center" label="Acciones">
              <div
                slot-scope="{ row, $index }"
                class="text-right table-actions">
                
                <el-tooltip
                  content="Delete"
                  effect="light"
                  :open-delay="300"
                  placement="top">
                  
                  <!----- Botón para eliminar plantilla ----->
                  <base-button
                    @click="deleteTemplate(row)"
                    type="danger"
                    icon
                    size="sm"
                    class="btn-link">

                    <i class="tim-icons icon-simple-remove "></i>
                  </base-button>
                  <!----------------------------------------->
                </el-tooltip>

              </div>
            </el-table-column>

          </el-table>
          <!-------------------------------------------->
        </div>
      </card>
    </div>
    <!------------------------------------------------------------------------------------------------------------------>
    <!------------------------------------------------------------------------------------------------------------------>
    <!------------------------------------------------------------------------------------------------------------------>


    <!-- JSONS -->
    <!----- <Json :value="templates"></Json> ----->

  </div>
</template>


<script>
import { Table, TableColumn }from "element-ui";
import { Select, Option } from "element-ui";

import Iotindicator from '../components/Widgets/Iotindicator.vue'
import Iotbutton from '../components/Widgets/Iotbutton.vue'
import Iotswitch from '../components/Widgets/Iotswitch.vue'
import Rtnumberchart from '../components/Widgets/Rtnumberchart.vue'
 
export default {

  middleware: "authenticated",

  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,

    Iotindicator,
    Iotbutton,
    Iotswitch,
    Rtnumberchart
  },
  
  data() {
    return {
      widgets: [],
      templates: [],
      widgetType: "",
      templateName: "",
      templateDescription: "",

      //----- Representación de un Widget -----
      ncConfig: {
        userId: "sampleuserid",
        selectedDevice: {
          name: "RDG",
          dId: "8888"
        },
        variableFullName: "Temperatura",
        variable: "varname",
        variableType: "input",
        variableSendFreq: "30",
        unit: "°C",
        class: "success",
        column: "col-12",
        decimalPlaces: 2,
        widget: "numberchart",
        icon: "fa-bath",
        chartTimeAgo: 60,
        demo: true
      },
      //---------------------------------------

      //----- Componente Switch -----
      iotSwitchConfig: {
        userId: "userid",
        selectedDevice: {
          name: "RDG",
          dId: "8888"
        },
        variableFullName: "Led 1",
        variable: "varname",
        variableType: "output",
        class: "danger",
        widget: "switch",
        icon: "fa-bath",
        column: "col-6"
      },
      //-----------------------------
/*
      //----- Componente Button -----
      configButton: {
        userId: "userid",
        selectedDevice: {
          name: "RDG",
          dId: "8888",
          //templateName: "Power Sensor",
          //templateId: "984237562348756ldksjfh",
          //saverRule: false
        },
        variableFullName: "Led 2",
        variable: "send",
        variableType: "output",
        icon: "fa-sun",
        column: "col-4",
        widget: "indicator",
        class: "danger",
        message: "{'status': 'stop'}"
      },
      //-----------------------------
*/
      //----- Componente Indicator -----
      iotIndicatorConfig: {
        userId: "userid",
        selectedDevice: {
          name: "RDG",
          dId: "8888"
        },
        variableFullName: "Pump",
        variable: "varname",
        variableType: "input",
        variableSendFreq: "30",
        class: "success",
        widget: "indicator",
        icon: "fa-bath",
        column: "col-6"
      },
      //--------------------------------

      //----- Componente Button -----
      configButton: {
        userId: "userid",
        selectedDevice: {
          name: "RDG",
          dId: "8888",
          templateName: "Power Sensor",
          templateId: "984237562348756ldksjfh",
          saverRule: false
        },
        variableFullName: "Pump",
        variable: "var1",
        variableType: "output",
        icon: "fa-sun",
        column: "col-4",
        widget: "button",
        class: "danger",
        message: "{'status': 'stop'}",
        text: "start"
      },
      //-----------------------------

      /*
      //----- Componente Indicator -----
      configIndicator: {
        userId: "userid",
        selectedDevice: {
          name: "RDG",
          dId: "8888",
          templateName: "Power Sensor",
          templateId: "984237562348756ldksjfh",
          saverRule: false
        },
        variableFullName: "Pump",
        variable: "var1",
        variableType: "input",
        variableSendFreq: "30",
        icon: "fa-sun",
        column: "col-6",
        widget: "indicator",
        class: "success"
      }
      //--------------------------------
      */
    };
  },

  mounted(){
    this.getTemplates();
  },

  methods: {

    //---------- GET TEMPLATES ----------
    async getTemplates() {

      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token //userId rescatado del token
        }
      };

      try {
        const res = await this.$axios.get("/template", axiosHeaders);
        console.log(res.data);

        if (res.data.status == "success") {
          this.templates = res.data.data;
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

    //---------- SAVE TEMPLATES ----------
    async saveTemplate() {
      //----- Para este método consultamos templates.js -----
      
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };
      console.log(axiosHeaders);

      // Objeto que contiene el template
      const toSend = {
        template: {
          name: this.templateName,
          description: this.templateDescription,
          widgets: this.widgets
        }
      }

      try {
        
        // (route, lo que queremos enviar, header)
        const res = await this.$axios.post("/template", toSend, axiosHeaders);
        
        if(res.data.status == "success"){
          this.$notify({
            type: "success",
            icon: "tim-icons icon-alert-circle-exc",
            message: "¡Plantilla creada!"
          });

          // Si todo sale bien, obtenemos la plantilla
          this.getTemplates();

          //Limpiamos la vista de templates
          this.widgets = []

        }
      } catch (err) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error al crear la plantilla"
        });
        console.log(err);
        return;
      }

    },

    //---------- DELETE TEMPLATES ----------
    async deleteTemplate(template) {

      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        },
        params:{
          templateId:template._id
        }
      };

      console.log(axiosHeaders);

      try {

        const res = await this.$axios.delete("/template", axiosHeaders);

        //----- Evitamos borrar una plantilla pertenenciente a algún dispositivo -----
        if (res.data.status == "fail" && res.data.error == "template in use") {

          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: template.name + " -> Esta plantilla está en uso, primero elimina el dispositivo"
          });
          
          return;
        }
        //----------------------------------------------------------------------------

        if (res.data.status == "success") {
          this.$notify({
            type: "success",
            icon: "tim-icons icon-alert-circle-exc",
            message: template.name + " fue eliminado correctamente"
          });
          
          this.getTemplates();
        }
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error obteniendo plantillas..."
        });
        console.log(error);
        return;
      }
    },

    //---------- Función para agregar Widgets ----------
    addNewWidget() {
      if (this.widgetType == "numberchart") {                         //Tipo de Widget
        this.ncConfig.variable = this.makeid(10);                     //Obtenemos un varname aleatorio para el Widget
        //Guardamos el componente ncConfig en el array widgets. Observación: el widget ya creado no se modifica
        this.widgets.push(JSON.parse(JSON.stringify(this.ncConfig)));
      }

      if (this.widgetType == "switch") {
        this.iotSwitchConfig.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.iotSwitchConfig)));
      }

      if (this.widgetType == "button") {
        this.configButton.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.configButton)));
      }

      if (this.widgetType == "indicator") {
        this.iotIndicatorConfig.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.iotIndicatorConfig)));
      }
    },
    //--------------------------------------------------

    //---------- Función para eliminar Widgets ----------
    deleteWidget(index) {
      this.widgets.splice(index, 1);
    },
    //---------------------------------------------------

    //---------- Función para generar arrays aleatorios ----------
    makeid(length) {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    }
    //------------------------------------------------------------

  }
};

</script>