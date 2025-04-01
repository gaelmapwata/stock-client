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
import { object, string, number } from 'yup'
import { Form } from 'vee-validate'
import { storeToRefs } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'
import { useTypeArticleStore } from '@/stores/typeArticle'
import { useArticleStore } from '@/stores/article'
import { ArticleI } from '~/types/article'

const snackbarStore = useSnackbarStore()
const typeArticleStore = useTypeArticleStore()
const articleStore = useArticleStore()
const { loading: typeArticleLoading, typeArticles } = storeToRefs(typeArticleStore)

const props = defineProps({
  modelValue: Boolean,
  action: { type: String, default: '' },
  entity: { type: Object as PropType<ArticleI>, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'created', 'updated'])

const { showErrorSnackbar } = snackbarStore
const { fetchTypeArticles } = typeArticleStore
const { updateArticle, storeArticle } = articleStore

const form = ref<typeof Form>()
const actionLoading = ref(false)

const dialogTitle = computed(() => (props.action === 'create' ? 'Création d\'un article' : 'Modifier l\' article'))
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
  { name: 'label', placeholder: 'Veuillez entre l\' article', label: 'Article', type: 'text' },
  { name: 'description', placeholder: 'Veuillez entre la description de l\' article', label: 'Description', type: 'text' },
  { name: 'stockQuantity', placeholder: 'Veuillez entre la quantité en stock', label: 'Quantité stock', type: 'text' },
  {
    name: 'typeArticleId',
    placeholder: 'Veuillez sélectionner le type article',
    label: 'Type Article',
    type: 'select',
    items: typeArticles.value,
    loading: typeArticleLoading.value,
    itemTitle: 'label'
  }
])
const formSchema = object({
  label: string()
    .max(255)
    .required('Veuillez renseigner le label'),
  stockQuantity: number()
    .typeError('La quantité doit être un nombre') // Gère le cas où ce n'est pas un nombre
    .positive('La quantité doit être un nombre positif') // Assure que c'est > 0
    .integer('La quantité doit être un entier') // Assure qu'il n'y a pas de décimales
    .max(255, 'La quantité ne peut pas dépasser 255')
    .required('Veuillez renseigner la quantité en stock')
})

async function onSubmit () {
  if (form.value) {
    const { valid } = await form.value.validate()
    if (valid) {
      actionLoading.value = true
      if (props.action === 'create') {
        await storeArticle(form.value.getValues())
        emit('created')
      } else if (props.action === 'update') {
        await updateArticle(form.value.getValues())
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
