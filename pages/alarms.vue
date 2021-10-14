<template>
  <div>
      <!-------------------------------------------------------------------------->
      <!-------------------- FORMULARIO PARA CREAR UNA ALARMA -------------------->
      <!-------------------------------------------------------------------------->
      <div class="row">
        <div class="col-sm-12">

            <!----- Mostramos el formulario solo si hay dispositivos creados ----->
            <card v-if="$store.state.devices.length > 0 ">
            <!----- Encabezado ----->
            <div slot="header">
                <h4 class="card-title">Agregar nueva alarma</h4>
            </div>

            <div class="row">

                <!----- PRIMERA COLUMNA ----->
                <div class="col-3" >
                    <el-select
                        required class="select-success"
                        placeholder="Variable"
                        v-model="selectedWidgetIndex"
                        style="margin-top: 25px;">

                        <el-option
                            v-for="widget,
                            index in $store.state.selectedDevice.template.widgets"
                            :key="index"
                            class="text-dark"
                            :value="index"
                            :label="widget.variableFullName"></el-option>
                    </el-select>
                </div>

                <!----- SEGUNDA COLUMNA ----->
                <div class="col-3">
                <el-select required class="select-warning" placeholder="Condition" v-model="newRule.condition"
                    style="margin-top: 25px;">
                    <el-option class="text-dark" value="=" label="igual a"></el-option>
                    <el-option class="text-dark" value=">" label="mayor"></el-option>
                    <el-option class="text-dark" value=">=" label="mayor igual"></el-option>
                    <el-option class="text-dark" value="<" label="menor"></el-option>
                    <el-option class="text-dark" value="<=" label="menor igual"></el-option>
                    <el-option class="text-dark" value="!=" label="distinto"></el-option>
                </el-select>
                </div>

                <!----- TERCERA COLUMNA - UMBRAL NUMBER----->
                <div class="col-3">
                <base-input label="Value" v-model="newRule.value" type="number"></base-input>
                </div>

                <!----- CUARTA COLUMNA - TIGGER TIMER----->
                <div class="col-3">
                <base-input label="Trigger Time" v-model="newRule.triggerTime" type="number"></base-input>
                </div>

            </div>
            <br><br>

            <!---------- BOTÓN PARA AGREGAR UNA ALARMA ---------->
            <div class="row pull-right">
                <div class="col-12">
                <base-button @click="createNewRule()" native-type="submit" type="primary" class="mb-3" size="lg" :disabled="$store.state.devices.length == 0" >
                    Agregar alarma
                </base-button>
                </div>

            </div>

            </card>
            <card v-else>
            You need to select a device to create an Alarm
            </card>
        </div>
      </div>
      <!-------------------------------------------------------------------------->
      <!-------------------------------------------------------------------------->
      <!-------------------------------------------------------------------------->



      <!-------------------------------------------------------------------------->
      <!-------------------- FORMULARIO PARA CREAR UNA ALARMA -------------------->
      <!-------------------------------------------------------------------------->
      <div class="row" v-if="$store.state.devices.length > 0">
      <div class="col-sm-12">
        <card>
          <!----- Encabezado ----->
          <div slot="header">
            <h4 class="card-title">Alarmas creadas</h4>
          </div>

          <el-table
            v-if="$store.state.selectedDevice.alarmRules.length > 0"
            :data="$store.state.selectedDevice.alarmRules">

            <el-table-column
              prop="variableFullName"
              label="Nombre del dispositivo"
            ></el-table-column>

            <el-table-column prop="variable" label="Variable"></el-table-column>

            <el-table-column
              prop="condition"
              label="Condición"
            ></el-table-column>

            <el-table-column prop="value" label="Umbral"></el-table-column>

            <el-table-column
              prop="triggerTime"
              label="Trigger Time"
            ></el-table-column>

            <el-table-column prop="counter" label="Contador"></el-table-column>

            <!----- BOTÓN PARA ELIMINAR ALARMAS ----->
            <el-table-column header-align="right" align="right" label="Acciones">
              <div
                slot-scope="{ row, $index }"
                class="text-right table-actions"
              >
                <el-tooltip content="Delete" effect="light" placement="top">
                  <base-button
                    @click="deleteDevice(row)"
                    type="danger"
                    icon
                    size="sm"
                    class="btn-link"
                  >
                    <i class="tim-icons icon-simple-remove "></i>
                  </base-button>
                </el-tooltip>

                <el-tooltip content="Rule Status" style="margin-left: 20px;">
                  <i
                    class="fas fa-exclamation-triangle"
                    :class="{ 'text-warning': row.status }"
                  ></i>
                </el-tooltip>

                <!-- no ato row.status al v model porque al cambiar de status cambiaria directo sobre store lo que daría error en 
                      cambio uso el value, al accionar el switch no cambiará el objeto, pero podré cambiar el valor en la función -->
                <el-tooltip
                  content="Change Rule Status"
                  style="margin-left: 5px;"
                >
                  <base-switch
                    @click="updateStatusRule(row)"
                    :value="row.status"
                    type="primary"
                    on-text="ON"
                    off-text="OFF"
                    style="margin-top: 10px;"
                  ></base-switch>
                </el-tooltip>
              </div>
            </el-table-column>
          </el-table>

          <h4 v-else class="card-title">No Alarm Rules</h4>
        </card>
      </div>
    </div>


  </div>
</template>

<script>
import { Select, Option } from "element-ui";
import { Table, TableColumn } from "element-ui";

export default {
    middleware: "authenticated",
    components: {
        [Option.name]: Option,
        [Select.name]: Select,
        [Table.name]: Table,
        [TableColumn.name]: TableColumn
    },
    data() {
        return {
            //----- Listado de las alarmas creadas -----
            alarmRules: [],
            selectedWidgetIndex: null,
            //----- Parámetros de las alarmas -----
            newRule: {
                dId: null,
                status: true,
                variableFullName: null,
                variable: null,
                value: null,
                condition: null,
                triggerTime: null
            }
        };
    },

    methods: {
        createNewRule() {
            //----- Verificamos la selección todos los valores -----
            if (this.selectedWidgetIndex == null) {
                this.$notify({
                type: "warning",
                icon: "tim-icons icon-alert-circle-exc",
                message: "Selecciona un dispositivo."
                });
                return;
            }

            if (this.newRule.condition == null) {
                this.$notify({
                type: "warning",
                icon: "tim-icons icon-alert-circle-exc",
                message: "Debe seleccionar una condición."
                });
                return;
            }

            if (this.newRule.value == null) {
                this.$notify({
                type: "warning",
                icon: "tim-icons icon-alert-circle-exc",
                message: "Falta agregar un valor para el umbral."
                });
                return;
            }

            if (this.newRule.triggerTime == null) {
                this.$notify({
                type: "warning",
                icon: "tim-icons icon-alert-circle-exc",
                message: "La componente Trigger está vacía."
                });
                return;
            }
    
        //---------- Enviamos a la API nuestra nueva regla ----------
            //----- Capturamos el dId -----
            this.newRule.dId = this.$store.state.selectedDevice.dId;
            //----- Capturamos el variableFullName -----
            this.newRule.variableFullName = this.$store.state.selectedDevice.template.widgets[this.selectedWidgetIndex].variableFullName;
            //----- Capturamos la variable -----
            this.newRule.variable = this.$store.state.selectedDevice.template.widgets[this.selectedWidgetIndex].variable;

            const axiosHeaders = {
                headers: {
                token: this.$store.state.auth.token
                }
            };

            var toSend = {
                newRule: this.newRule
            };

            //---------- ENVIAMOS LA NUEVA REGLA CREADA ----------
            this.$axios.post("/alarm-rule", toSend, axiosHeaders).then(res => {
                if (res.data.status == "success") {
                
                //----- Limpiamos las casillas -----
                this.newRule.variable = null;
                this.newRule.condition = null;
                this.newRule.value = null;
                this.newRule.triggerTime = null;
                    
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', message: '¡Alarma creada!' });
                this.$store.dispatch("getDevices");
                return;
                }

            }).catch(e => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', message: 'Error creanda nueva alarma.' });
                console.log(e)
                return;
            });
        },

        deleteDevice(rule) {
            const axiosHeaders = {
                headers: {
                    token: this.$store.state.auth.token
                },
                params: {
                    emqxRuleId: rule.emqxRuleId
                }
            };

            this.$axios.delete("/alarm-rule", axiosHeaders).then(res => {
                if (res.data.status == "success") {
                    this.$notify({
                        type: "success",
                        icon: "tim-icons icon-check-2",
                        message: "Success! Alarm Rule was deleted"
                    });
                    this.$store.dispatch("getDevices");
                    return;
                }
            }).catch(e => {
                this.$notify({
                    type: "danger",
                    icon: "tim-icons icon-alert-circle-exc",
                    message: "Error"
                 });
                console.log(e);
                 return;
            });
        },

        updateStatusRule(rule) {
            const axiosHeaders = {
                headers: {
                    token: this.$store.state.auth.token
                }
            };

            var ruleCopy = JSON.parse(JSON.stringify(rule));
            ruleCopy.status = !ruleCopy.status;
            const toSend = { rule: ruleCopy };

            this.$axios.put("/alarm-rule", toSend, axiosHeaders).then(res => {
                if (res.data.status == "success") {
                    this.$notify({
                        type: "success",
                        icon: "tim-icons icon-check-2",
                        message: "Success! Alarm Rule was updated"
                    });
                    this.$store.dispatch("getDevices");
                    return;
                }
            }).catch(e => {
                this.$notify({
                    type: "danger",
                    icon: "tim-icons icon-alert-circle-exc",
                    message: "Error"
                });
                console.log(e);
                return;
            });
        }
    }
};
</script>
