//----- Creamos nuestros estados - variables -----
export const state = () => ({
    auth: null,
    devices: [],
    selectedDevice: {},
});
//------------------------------------------------

//----- Mutaciones = métodos -----
export const mutations = {

    setAuth(state, auth){
        state.auth = auth;
    },

    setDevices(state, devices) {
        state.devices = devices;
    },

    setSelectedDevice(state, device) {
        state.selectedDevice = device;
    },
};
//--------------------------------

//----- Acciones - Operamos con mutaciones -----
export const actions = {
    //----- Leemos el token -----
    readToken() {
        let auth = null;

        try {
            //----- Convertimos el string a objetos -----
            auth = JSON.parse(localStorage.getItem("auth"));
        } catch (err) {
            console.log(err);
        }

        //----- saving auth in state -----
        this.commit('setAuth' , auth);
        
    },

    getDevices() {

        const axiosHeader = {
            headers: {
            token: this.state.auth.token
            }
        };
    
        this.$axios.get("/device", axiosHeader).then(res => {
            console.log(res.data.data);

            res.data.data.forEach((device, index) => {
                if (device.selected){
                this.commit("setSelectedDevice", device);
                $nuxt.$emit('selectedDeviceIndex', index);
                }
            });
            this.commit("setDevices", res.data.data)

        }).catch(error => {
            console.log(error);
        });
    },
}
//----------------------------------------------