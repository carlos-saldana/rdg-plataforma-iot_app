<template>
    <card>
        <div slot="header">
            <h4 class = "card-title">{{config.selectedDevice.name}} - {{config.variableFullName}}</h4>
        </div>

        <i class="fa " :class="[config.icon, getIconColorClass()]" style="font-size: 25px"></i>
    </card>
</template>

<script>
    export default{
        //props: ['config'],
        data(){
            return{
                value: true, //inicia apagado
                config: {
                    userId: 'userid',
                    //contiene todos los datos de un dispostivo típico
                    selectedDevice: {
                        name: "Home", //Nombre del dispositivo
                        dId: "8888", //Serial number del dispositvo
                        templateName: "Power Sensor", //Plantilla del dispositivo
                        templateId: "123456789", //Id de la plantilla
                        saverRule: false,
                    },
                    variableFullName: "Pump", //Nombre de la variable
                    variable: "unniquestr", //Nombre de la variable a enviar atraves del topico
                    icon: "fa-sun", //icono
                    column: 'col-6', //columna del widget
                    widget: 'indicator', //tipo de widget
                    class: 'warning' //efecto del icono (clase)
                }
            };
        },
        //$ sirva para llamar cosas globales
        //AL CARGAR EL WIDGET-------------- suscripción
        mounted(){
            //cuando alguien llame al topico widget-topic haras processReceivedData
            this.$nuxt.$on('widget-topic', this.processReceivedData)
        },

        beforeDestroy(){
            //evitamos que se dupliquen las suscripciones
            this.$nuxt.$off(this.config.userId + "/" + this.config.selectedDevice.dId + "/" + this.config.variable + "/actdata")
        },

        methods: {
            processReceivedData(data){
                try {
                    console.log("received");
                    console.log(data);
                    this.value = data.value;
                    
                } catch (error) {
                    console.log(error);
                }
                
            },

            getIconColorClass(){
                if(!this.value){
                    return "text-dark"; //muestra apagado
                }

                if(this.config.class == "sucess"){
                    return "text-sucess";
                }

                if(this.config.class == "primary"){
                    return "text-primary";
                }

                if(this.config.class == "warning"){
                    return "text-warning";
                }

                if(this.config.class == "danger"){
                    return "text-danger";
                }
            }
        }
    };

    //userId/dId/temperature/sdata
    //userId/dId/unniquestr/sdata
</script>

