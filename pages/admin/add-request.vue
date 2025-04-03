<template>
  <div class="page-mini-container">
    <div class="mx-auto my-5" style="max-width: 800px;">
      <Form
        ref="requestFormRef"
        :validation-schema="requestSchema"
        class="mt-10"
        @submit="saveRequest"
      >
        <div class="mx-auto" style="max-width: 400px;">
          <div class="my-5">
            <Field v-slot="{ field, errorMessage }" name="requestQuantity">
              <v-text-field
                v-bind="field"
                :error-messages="errorMessage"
                variant="solo-filled"
                label="Insérer la quantité demander"
                placeholder="Quantité demander"
                type="number"
                rounded
                flat
              />
            </Field>
          </div>

          <div class="my-5">
            <Field v-slot="{ field, errorMessage }" name="article">
              <v-select
                v-model="selectedArticle"
                v-bind="field"
                :items="articles"
                :error-messages="errorMessage"
                item-title="label"
                item-value="id"
                variant="solo-filled"
                label="Sélectionner l'article"
                rounded
                flat
              />
            </Field>
          </div>
        </div>

        <div class="d-flex justify-end mb-4">
          <v-btn
            :loading="saveLoading"
            :disabled="saveLoading"
            color="primary"
            type="submit"
            rounded="xl"
          >
            <span class="text-none mr-2">Enregistrer la demande</span>
            <v-icon>mdi-arrow-top-right</v-icon>
          </v-btn>
        </div>
      </Form>
    </div>
    <CommonConfirmDialog
      v-model="confirmDialogVisible"
      :text="textConfirmRequest"
      action-icon="mdi-check"
      action-text="Confirm"

      @confirm="onConfirmRequest"
    />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { Form, Field } from 'vee-validate'
import { object, string, number } from 'yup'
import { useArticleStore } from '@/stores/article'
import { useRequestStore } from '@/stores/request'
import { shouldHaveOneOfPermissions } from '~/utilities/auth.util'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({ next, permissions: ['REQUEST:CREATE'] })]
})

useAdminBreadcrumb('mdi-account-group', [{
  title: 'Demande',
  href: '/admin/add-request'
}])

const articleStore = useArticleStore()
const requestStore = useRequestStore()
// const { showErrorSnackbar } = snackbarStore

const { storeRequest } = requestStore
const { fetchArticles } = articleStore
const { articles } = storeToRefs(articleStore)

const requestSchema = object({
  requestQuantity: number().positive().required(),
  article: string().required()
})

const selectedArticle = ref(null)
const saveLoading = ref(false)
const requestFormRef = ref(null)
const confirmDialogVisible = ref(false)
const textConfirmRequest = ref('')

function saveRequest () {
  const requestQuantity = requestFormRef.value?.getValues().requestQuantity
  const article = selectedArticle.value

  textConfirmRequest.value = ` Confirmation de la
        quantité ${requestQuantity}
        pour l' ${article}`
  confirmDialogVisible.value = true
}

function onConfirmRequest () {
  saveLoading.value = true
  storeRequest({
    requestQuantity: requestFormRef.value?.getValues().requestQuantity,
    articleId: selectedArticle.value
  })
    .then(() => {
      requestFormRef.value?.resetForm()
      selectedArticle.value = null
      saveLoading.value = false
    })
    .catch(() => { saveLoading.value = false })
}

function loadData () {
  fetchArticles()
}

loadData()

</script>
