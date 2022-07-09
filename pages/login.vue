<template>
  <v-app>
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col cols="4">
          <v-card class="pa-1">
            <v-card-title>
              <v-spacer/><img height="78" src="/images/varosa-logo-final.png" alt="varosa-logo"><v-spacer/>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <p>Welcome to login of Varosa Services HR Solution. Enter the necessary credentials to continue.</p>
              <v-divider></v-divider>
              <v-form>
                <v-text-field v-model="email" :error-messages="usernameErrors"
                              autofocus
                              filled
                              hint="example@mydomain.com"
                              label="Username"
                              placeholder="Enter your username here..."
                              prepend-inner-icon="fas fa-user"
                              @blur="$v.email.$touch()"
                              @input="$v.email.$touch()"
                              v-on:keyup.enter="login"
                ></v-text-field>
                <v-text-field v-model="password" :append-icon="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"
                              :error-messages="passwordErrors"
                              :type="showPassword ? 'text' : 'password'"
                              filled
                              label="Password"
                              placeholder="Enter your password here..."
                              prepend-inner-icon="fas fa-key"
                              @blur="$v.password.$touch()"
                              @input="$v.password.$touch()"
                              @click:append="showPassword = !showPassword"
                              v-on:keyup.enter="login"
                ></v-text-field>
                <v-divider></v-divider>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn :disabled="$v.$invalid" block color="primary" x-large
                     @click="login">
                <span>Login</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import {mapActions} from 'vuex';
import {validationMixin} from 'vuelidate';
import {email, minLength, required} from "vuelidate/lib/validators";

export default {
  mixins: [validationMixin],
  name: "Login",
  layout: "login",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
    };
  },
  validations: {
    email: {required},
    password: {required}
  },
  computed: {
    usernameErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.required && errors.push('Username is required.');
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.required && errors.push('Password is required.');
      return errors;
    }
  },
  methods: {
    login() {
      const temp = this;
      this.$store.dispatch('auth/loginOrRegister', {
        route: "login",
        data: {
          name: temp.email,
          password: temp.password,
        }
      });
    }
  },

}
</script>

<style scoped>

</style>
