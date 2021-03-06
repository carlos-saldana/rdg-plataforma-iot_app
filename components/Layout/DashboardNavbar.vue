<template>
  <base-nav
    v-model="showMenu"
    class="navbar-absolute top-navbar"
    type="white"
    :transparent="true"
  >
    <div slot="brand" class="navbar-wrapper">
      <div
        class="navbar-toggle d-inline"
        :class="{ toggled: $sidebar.showSidebar }"
      >
        <button type="button" class="navbar-toggler" @click="toggleSidebar">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </button>
      </div>
      <a class="navbar-brand ml-xl-3 ml-5" href="#pablo">{{ routeName }}</a>
    </div>

    <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">
      <el-select
        class="select-success"
        placeholder="Select device"
        @change="selectDevice()"
        v-model="selectedDevice"
      >
        <el-option
          v-for="(device, index) in $store.state.devices"
          :value="index"
          :label="device.name"
          :key="device._id"
        >
        </el-option>
      </el-select>

    </ul>
  </base-nav>
</template>
<script>
import { CollapseTransition } from "vue2-transitions";
import { BaseNav, Modal } from "@/components";
import { Select, Option } from "element-ui";

export default {
  components: {
    CollapseTransition,
    BaseNav,
    Modal,
    [Option.name]: Option,
    [Select.name]: Select
  },
  computed: {
    routeName() {
      const { path } = this.$route;
      let parts = path.split("/");
      if (parts == ",") {
        return "Dashboard";
      }
      return parts.map(p => this.capitalizeFirstLetter(p)).join(" ");
    },
    isRTL() {
      return this.$rtl.isRTL;
    }
  },
  data() {
    return {
      activeNotifications: false,
      showMenu: false,
      searchModalVisible: false,
      searchQuery: "",
      selectedDevice: null
    };
  },
  mounted() {
    this.$store.dispatch("getDevices");
    this.$nuxt.$on("selectedDeviceIndex", this.updateSelectedDeviceIndex);
  },
  beforeDestroy(){
    this.$nuxt.$off("selectedDeviceIndex");
  },
  methods: {
    updateSelectedDeviceIndex(index){
      this.selectedDevice = index;
    },
    selectDevice() {
      const device = this.$store.state.devices[this.selectedDevice];

      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      const toSend = {
        dId: device.dId
      };

      this.$axios
        .put("/device", toSend, axiosHeaders)
        .then(res => {
         
          this.$store.dispatch("getDevices");

        })
        .catch(e => {
          console.log(e);
          return;
        });

    },
    capitalizeFirstLetter(string) {
      if (!string || typeof string !== "string") {
        return "";
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>
<style scoped>
.top-navbar {
  top: 0px;
}
</style>
