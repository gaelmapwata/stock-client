<template>
  <CommonDialog
    v-model="dialog"
    :title="dialogTitle"
    :submit="onSubmit"
    :action-loading="actionLoading"
    width="400"
    action-text="Confirmer"
  >
    <Form
      ref="form"
      :validation-schema="formSchema"
      :initial-values="initialValues"
      @submit="onSubmit"
    >
      <DynamicFields :fields="fields" />
    </Form>
  </CommonDialog>
</template>
<script lang="ts" setup>
import { object, string } from 'yup'
import { Form } from 'vee-validate'
import { useSnackbarStore } from '@/stores/snackbar'
import { useTypeArticleStore } from '@/stores/typeArticle'
import { typeArticleI } from '~/types/typearticle'

const snackbarStore = useSnackbarStore()
const typeArticleStore = useTypeArticleStore()

const props = defineProps({
  modelValue: Boolean,
  action: { type: String, default: '' },
  entity: { type: Object as PropType<typeArticleI>, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'created', 'updated'])

const { showErrorSnackbar } = snackbarStore
const { fetchTypeArticles } = typeArticleStore
const { updateTypeArticle, storeTypeArticle } = typeArticleStore

const form = ref<typeof Form>()
const actionLoading = ref(false)

const dialogTitle = computed(() => (props.action === 'create' ? 'Création d\'un typeArticle' : 'Modifier le typeArticle'))
const dialog = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emit('update:modelValue', value)
  }
})
const initialValues = computed(() => {
  if (props.action === 'update') {
    return props.entity || {}
  }
  return {}
})

const fields = computed(() => [
  { name: 'label', placeholder: 'Veuillez entre le label', label: 'label', type: 'text' }
])
const formSchema = object({
  label: string()
    .max(255)
    .required('Veuillez renseigner l\'e-mail')
})
async function onSubmit () {
  if (form.value) {
    const { valid } = await form.value.validate()
    if (valid) {
      actionLoading.value = true
      if (props.action === 'create') {
        await storeTypeArticle(form.value.getValues())
        emit('created')
      } else if (props.action === 'update') {
        await updateTypeArticle(form.value.getValues())
        emit('updated')
      }
      actionLoading.value = false
      form.value.resetForm()
      dialog.value = false
    } else {
      showErrorSnackbar('Formulaire incorrect')
    }
  }
}
fetchTypeArticles()
</script>
