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
        props: ['config'],
        data(){
            return{
                value: true, //--- Inicia apagado ---
                topic: "",
                props: ['config']
            };
        },
        watch:  {
            config: {
                immediate: true,
                deep: true,
                handler() {
                    setTimeout(() => {
                        this.value = false;
                        this.$nuxt.$off(this.topic);

                        //userId/dId/uniquestr/sdata
                        const topic = this.config.userId + "/" + this.config.selectedDevice.dId + "/" + this.config.variable + "/sdata";
                        this.$nuxt.$on(topic, this.processReceivedData);

                    }, 300);
                }
            }
        },
        //--- $ sirva para llamar cosas globales ---
        //AL CARGAR EL WIDGET-------------- suscripción
        mounted(){
            const topic = this.config.userId + "/" + this.config.selectedDevice.dId + "/" + this.config.variable + "/sdata";
            //----- Cuando alguien llame a este tópico ejecutaremos processReceivedData -----
            this.$nuxt.$on('widget-topic', this.processReceivedData)
        },

        beforeDestroy(){
            //----- Evitamos que se dupliquen las suscripciones -----
            this.$nuxt.$off(this.topic);
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

