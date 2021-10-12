<template>
    <card>
        <div slot="header">
            <h4 class = "card-title">{{config.selectedDevice.name}} - {{config.variableFullName}}</h4>
        </div>

         <i class="fa " :class="[config.icon, getIconColorClass()]" style="font-size: 25px"></i>
         
         <base-button @click="sendValue()" :type="config.class" class="mb-3 pull-right" size="lg">Agregar dispositivo</base-button>
    </card>
</template>

<script>
    export default{
        props: ['config'],
        data(){
            return{
                sending: false, //estamos enviando mensajes?
            };
        },

        mounted(){
        },

        methods: {
            sendValue(){
                //si presionamos el boton se vuelve true
                this.sending = true;

                setTimeout(() =>{
                    this.sending = false //se vuelve a apagar
                }, 500) //se apaga 1segundo después

                //enviamos este objeto a nuestro cliente mqtt
                const toSend = {
                    topic: this.config.userId + "/" + this.config.selectedDevice.dId + "/" + this.config.variable + "/actdata",
                    msg: {
                        value: this.config.message
                    }

                };

                //mandamos
                console.log(toSend);
                this.$nuxt.$emit('mqtt-sender', toSend);
            },

            getIconColorClass(){
                if(!this.sending){
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

