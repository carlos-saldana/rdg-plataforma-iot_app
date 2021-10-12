<template>
  <div class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications> <!-- Permite visualización de notificaciones -->

    <!------------------------------------------------------------------------------------------------------------------------------------->
    <!-------------------------------------------------- SIDE-BAR PRINCIPAL DEL PROYECTO -------------------------------------------------->
    <!------------------------------------------------------------------------------------------------------------------------------------->

    <!-- side-bar es un componente creado en este proyecto Nuxt-->
    <side-bar
      :background-color="sidebarBackground" 
      short-title="RDG"
      title="RDG"
    >

    <!-- Contenido dentro de este primer side-bar -->
      <template slot-scope="props" slot="links">

        <!-- Enlace a DASHBOARD -->
        <sidebar-item
          :link="{
            name: 'Dashboard',
            icon: 'tim-icons icon-chart-pie-36',
            path: '/dashboard'
          }"
        >
        </sidebar-item>

        <!-- Enlace a DEVICES -->
        <sidebar-item
          :link="{
            name: 'Devices',
            icon: 'tim-icons icon-chart-pie-36',
            path: '/devices'
          }"
        >
        </sidebar-item>

        <!-- Enlace a ALARMS -->
        <sidebar-item
          :link="{
            name: 'Alarms',
            icon: 'tim-icons icon-chart-pie-36',
            path: '/alarms'
          }"
        >
        </sidebar-item>

        <!-- Enlace a TEMPLATES -->
        <sidebar-item
          :link="{
            name: 'Templates',
            icon: 'tim-icons icon-chart-pie-36',
            path: '/templates'
          }"
        >
        </sidebar-item>

        <!-- Enlace a ABOUT US -->
        <sidebar-item
          :link="{
            name: 'About us',
            icon: 'tim-icons icon-chart-pie-36',
            path: '/nosotros'
          }"
        >
        </sidebar-item>

      </template>
    </side-bar>
    <!------------------------------------------------------------------------------------------------------------------------------------->
    <!------------------------------------------------------------------------------------------------------------------------------------->
    <!------------------------------------------------------------------------------------------------------------------------------------->



    <!----------------------------------------------------------------------------------------------------------------------------------->
    <!-------------------------------------------------- CUERPO PRINCIPAL DEL PROYECTO -------------------------------------------------->
    <!----------------------------------------------------------------------------------------------------------------------------------->
    <div class="main-panel" :data="sidebarBackground">

      <dashboard-navbar></dashboard-navbar> <!-- Header -->
      <router-view name="header"></router-view>

      <!-- Acomoda la página cuando se reduce o agranda -->
      <div :class="{ content: !isFullScreenRoute }" @click="toggleSidebar">
        <!-- Transición al cambiar de ruta -->
        <zoom-center-transition :duration="1000" mode="out-in">
          <!-- your content here -->
          <nuxt></nuxt>
        </zoom-center-transition>
      </div>

      <content-footer v-if="!isFullScreenRoute"></content-footer>
    </div>
  </div>
</template>
<!----------------------------------------------------------------------------------------------------------------------------------->
<!----------------------------------------------------------------------------------------------------------------------------------->
<!----------------------------------------------------------------------------------------------------------------------------------->



<!--------------------------------------------------------------------------------------------------------------->
<!-------------------------------------------------- FUNCIONES -------------------------------------------------->
<!--------------------------------------------------------------------------------------------------------------->
<script>
/* eslint-disable no-new */
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import SidebarShare from "@/components/Layout/SidebarSharePlugin";
function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

import DashboardNavbar from "@/components/Layout/DashboardNavbar.vue";
import ContentFooter from "@/components/Layout/ContentFooter.vue";
import DashboardContent from "@/components/Layout/Content.vue";
import { SlideYDownTransition, ZoomCenterTransition } from "vue2-transitions";

//----- Importamos la librería mqtt para crear nuestro cliente -----
import mqtt from 'mqtt';
//------------------------------------------------------------------

export default {
  components: {
    DashboardNavbar,
    ContentFooter,
    DashboardContent,
    SlideYDownTransition,
    ZoomCenterTransition,
    SidebarShare
  },

  data() {
    return {
      //---------- COLOR DE FONDO PARA LA PÁGINA ----------
      sidebarBackground: "blue", //vue|blue|orange|green|red|primary

      //----- Cliente mqtt -----
      client: null,

      options:{
        //----- Parámetros -----
        host: process.env.mqtt_host,
        port: process.env.mqtt_port,
        endpoint: "/mqtt",
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 5000,

        clientId: "web_" + this.$store.state.auth.userData.name + "_" + Math.floor(Math.random() * 1000000 + 1),
        username: "superuser",
        password: "superuser"
      }
    };
  },

  computed: {
    isFullScreenRoute() {
      return this.$route.path === "/maps/full-screen";
    }
  },

  beforeDestroy(){
    this.$nuxt.$off("mqtt-sender");
  },

  mounted() {
    this.initScrollbar();

    setTimeout(() =>{
      //----- Llamamos a nuestro método -----
      this.startMqttClient();
    }, 2000);
  },

  methods: {

    //-----------------------------------------------
    //------------------ MI MÉTODO ------------------
    //-----------------------------------------------
    
    //---------- Obtenemos credenciales mqtt ----------
    async getMqttCredentials() {

      try {
        
        //----- Preparamos los headers -----
        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.token
          }
        };

        const credentials = await this.$axios.post("/getmqttcredentials", null ,axiosHeaders);
        console.log(credentials.data);

        //----- Revisar la ruta users.js -----
        if(credentials.data.status == "success"){
          this.options.username = credentials.data.username;
          this.options.password = credentials.data.password;
        }


      } catch (error) {
        console.log("*********************************************************".red);
        console.log("***** ERROR - async getMqttCredentials, default.vue *****".red);
        console.log("*********************************************************".red);
        console.log(error);

        if (error.response.status == 401){
          console.log("TOKEN NO VÁLIDO".red);
          localStorage.clear();

          //----- Eliminamos el token de la store -----
          const auth = {};
          this.$store.commit("setAuth", auth);
          //-------------------------------------------

          window.location.href = "/login";
        }
      }
           

    },
    //-------------------------------------------------

    //----- Traemos credenciales para reconexión -----
    async getMqttCredentialsForReconnection() {

      try {
        
        //----- Preparamos los headers -----
        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.token
          }
        };

        const credentials = await this.$axios.post("/getmqttcredentialsforreconnection", null ,axiosHeaders);
        console.log(credentials.data);

        //----- Revisar la ruta users.js -----
        if(credentials.data.status == "success"){
          this.client.options.username = credentials.data.username;
          this.client.options.password = credentials.data.password;
        }


      } catch (error) {
        console.log("*********************************************************".red);
        console.log("***** ERROR - async getMqttCredentialsForReconnection, default.vue *****".red);
        console.log("*********************************************************".red);
        console.log(error);

        if (error.response.status == 401){
          console.log("TOKEN NO VÁLIDO".red);
          localStorage.clear();

          //----- Eliminamos el token de la store -----
          const auth = {};
          this.$store.commit("setAuth", auth);
          //-------------------------------------------

          window.location.href = "/login";
        }
      }
           

    },
    //------------------------------------------------
    

    //---------- Inicia nuestro cliente mqtt ----------
    async startMqttClient(){

      //----- Obtenemos las credenciales mqtt -----
      //await this.getMqttCredentials();

      //topic example: "userId/dId/variableId/sdata"

      //----- Tópicos a suscribirnos -----
      const deviceSubscribeTopic = this.$store.state.auth.userData._id + "/+/+/sdata";
      const notifSubscribeTopic = this.$store.state.auth.userData._id + "/+/+/notif";

      const connectUrl = process.env.mqtt_prefix + this.options.host + ":" + this.options.port + this.options.endpoint;

      try {
        //----- Creamos un cliente mqtt -----
        this.client = mqtt.connect(connectUrl, this.options);
        
      } catch (error) {
        console.log("******************************************************".red);
        console.log("***** ERROR - async startMqttClient, default.vue *****".red);
        console.log("******************************************************".red);
        console.log(error);
      }

      //----- Sucede la conexión -----
      this.client.on('connect', () =>{

        console.log(this.client);

        console.log("Conexón mqtt exitosa");

        //----- Suscripción SDATA -----
        this.client.subscribe(deviceSubscribeTopic, {qos: 0}, (err) => {
          if (err){
            console.log("Error en deviceSubscribeTopic");
            return;
          }
          console.log("¡Subscripción exitosa para sdata!");
          console.log(deviceSubscribeTopic);
        });

        //----- Suscripción NOTIF -----
        this.client.subscribe(notifSubscribeTopic, {qos: 0}, (err) => {
          if (err){
            console.log("Error en notifSubscribeTopic");
            return;
          }
          console.log("¡Subscripción exitosa para notif!");
          console.log(notifSubscribeTopic);
        });

      });

      this.client.on('error', error => {
          console.log('¡Connection fallida!', error)
      })

      this.client.on("reconnect", (error) => {
          console.log("Intentando reconexión...", error);

          //----- Método que trae credenciales para reconexión -----
          //this.getMqttCredentialsForReconnection();
      });

      //----- Llega un mensaje -----
      this.client.on('message', (topic, message) =>{
        console.log("Mensaje de mqtt recibido");
        console.log("Tópico -> " + topic);
        console.log(message.toString()); //Recibimos el payload

        try {
          //----- Identificamos el tipo de mensaje -----
          const splittedTopic = topic.split("/");
          const msgType = splittedTopic[3];

          if(msgType == "notif"){
            this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: message.toString });
            return;

          }else if(msgType == "sdata"){
            $nuxt.$emit(topic, JSON.parse(message.toString()));
            return;
          }
          
        } catch (error) {
          console.log(error);
          
        }


      });
    
      //----- Mensaje nuxt redirigido a mqtt (revisar Iotbutton.vue)-----
      $nuxt.$on('mqtt-sender', (toSend) => {
        this.client.publish(toSend.topic, JSON.stringify(toSend.msg));
      });
    
    },
    //-------------------------------------------------


    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },

    initScrollbar() {
      let docClasses = document.body.classList;
      let isWindows = navigator.platform.startsWith("Win");
      if (isWindows) {
        // if we are on windows OS we activate the perfectScrollbar function
        initScrollbar("sidebar");
        initScrollbar("main-panel");
        initScrollbar("sidebar-wrapper");

        docClasses.add("perfect-scrollbar-on");
      } else {
        docClasses.add("perfect-scrollbar-off");
      }
    }
  },

};
</script>

<style lang="scss">
$scaleSize: 0.95;
@keyframes zoomIn95 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
  to {
    opacity: 1;
  }
}

.main-panel .zoomIn {
  animation-name: zoomIn95;
}

@keyframes zoomOut95 {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}

.main-panel .zoomOut {
  animation-name: zoomOut95;
}
</style>
<!--------------------------------------------------------------------------------------------------------------->
<!--------------------------------------------------------------------------------------------------------------->
<!--------------------------------------------------------------------------------------------------------------->