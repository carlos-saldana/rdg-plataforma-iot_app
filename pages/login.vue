<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <card class="card-login card-white">
        <template slot="header">
          <img src="img//card-primary.png" alt="" />
          <h1 class="card-title">Robotics Development Group</h1>
        </template>

        <div>
          <!---------- EMAIL ---------->
          <base-input
            name="email"
            v-model="user.email"
            placeholder="Email"
            addon-left-icon="tim-icons icon-email-85"
          ></base-input>
          <!--------------------------->

          <!---------- PASSWORD ---------->
          <base-input
            name="password"
            v-model="user.password"
            type="password"
            placeholder="Password"
            addon-left-icon="tim-icons icon-lock-circle"
          ></base-input>
          <!------------------------------>
        </div>

        <!---------- BUTTON LOGIN ---------->
        <div slot="footer">
          <base-button
            native-type="submit"
            type="primary"
            class="mb-3"
            size="lg"
            @click="login()"
            block
          >Ingresar</base-button>
          <!---------------------------------->

          <!---------- BUTTON CREAR CUENTA ---------->
          <div class="pull-right">
            <h6>
              <nuxt-link class="link footer-link" to="/register">
                register
              </nuxt-link>
            </h6>
          </div>
          <!----------------------------------------->
        </div>
      </card>
    </div>
  </div>
</template>

<script>
const Cookie = process.client ? require("js-cookie") : undefined;
export default {
  // No tiene que tener autenticacion
  middleware: 'notAuthenticated',
  name: "login-page",
  layout: "auth",
  data() {
    return {
      user: {
        email: "",
        password: ""
      }
    };
  },
  mounted() {

  },
  methods: {
    login() {
      this.$axios
        .post("/login", this.user)
        .then(res => {

          //success! - Usuario creado.
          if (res.data.status == "success") {

            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Welcome " + res.data.userData.name
            });

            console.log(res.data) //Adquirimos toda la respuesta

            //RECIBIMOS EL TOKEN---------------
            const auth = {
              token: res.data.token,
              userData: res.data.userData
            }

            //token to de store - token a la tienda (conecction to index.js store)
            this.$store.commit('setAuth', auth);

            //set auth object in localStore
            localStorage.setItem('auth', JSON.stringify(auth))

            $nuxt.$router.push('dashboard'); //vamos al dashboard

            return;
          }
        })
        .catch(e => {
          console.log(e.response.data);

          if (e.response.data.error.errors.email.kind == "unique") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "User already exists :("
            });

            return;
          } else {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Error creating user..."
            });

            return;
          }
        });
    }
  }
};
</script>

<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
