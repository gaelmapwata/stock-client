<template>
  <div class="page-container">
    <div class="d-flex mb-4 justify-end">
      <v-btn
        v-if="userHasOneOfPermissions(['TYPE_ARTICLE:CREATE'])"
        prepend-icon="mdi-plus"
        color="primary"
        rounded="xl"
        @click="onAddTypeArticle()"
      >
        <span class="text-none">Ajouter</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['TYPE_ARTICLE:UPDATE'])"
        :disabled="!selectedTypeArticle"
        prepend-icon="mdi-pencil"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onEditTypeArticle()"
      >
        <span class="text-none">Modifier</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['TYPE_ARTICLE:DELETE'])"
        :disabled="!selectedTypeArticle || deletionInLoading"
        :loading="deletionInLoading"
        prepend-icon="mdi-delete"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onDeleteTypeArticle()"
      >
        <span class="text-none">Supprimer</span>
      </v-btn>
    </div>
    <v-card rounded="xl" elevation="0">
      <template #text>
        <v-data-table
          v-model="selectedTypeArticles"
          v-model:items-per-page="itemsPerPage"
          v-model:expanded="expanded"
          v-model:page="page"
          :headers="(headers as any)"
          :items="typeArticles"
          :loading="typeArticleLoading"
          items-per-page-text="Items par page"
          item-value="id"
          select-strategy="single"
          show-expand
          show-select
          return-object
        >
          <template #[`item.index`]="{ index }">
            {{ (itemsPerPage * (page - 1)) + index + 1 }}
          </template>
        </v-data-table>
      </template>
    </v-card>
    <TypeArticleFormDialog
      v-model="typeArticleFormDialogVisible"
      :action="typeArticleFormDialogAction"
      :entity="selectedTypeArticle || undefined"
    />
    <CommonConfirmDialog
      v-model="confirmDialogVisible"
      :text="textConfirmDeletion"
      @confirm="onConfirmDeletion"
    />
  </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useTypeArticleStore } from '@/stores/typeArticle'
import { shouldHaveOneOfPermissions, userHasOneOfPermissions } from '@/utilities/auth.util'
import { typeArticleI } from '~/types/typearticle'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({ next, permissions: ['TYPE_ARTICLE:READ'] })]
})

const typeArticleStore = useTypeArticleStore()
const { loading: typeArticleLoading, typeArticles } = storeToRefs(typeArticleStore)
const { fetchTypeArticles, deleteTypeArticle } = typeArticleStore

useAdminBreadcrumb('mdi-security', [{
  title: 'TypeArticles',
  href: '/admin/type-article'
}])

const expanded = ref([])
const itemsPerPage = ref(10)
const page = ref(1)
const selectedTypeArticles = ref<typeArticleI[]>([])
const typeArticleFormDialogVisible = ref(false)
const typeArticleFormDialogAction = ref<string | undefined>(undefined)
const confirmDialogVisible = ref(false)
const deletionInLoading = ref(false)

const textConfirmDeletion = computed(
  () => `Voulez-vous vraiment supprimer le typeArticle <strong>"${selectedTypeArticle.value?.label}"</strong> ?`
)

const selectedTypeArticle = computed<typeArticleI | null>(
  () => (selectedTypeArticles.value.length > 0 ? selectedTypeArticles.value[0] : null)
)

watch(typeArticles, (newtypeArticles) => {
  if (selectedTypeArticle.value) {
    // eslint-disable-next-line max-len
    const freshTypeArticle = newtypeArticles.find(typeArticle => typeArticle.id === selectedTypeArticle.value?.id)
    selectedTypeArticles.value = freshTypeArticle ? [freshTypeArticle] : []
  }
})

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: false,
    key: 'index'
  },
  {
    title: 'Label',
    key: 'label'
  }
]

fetchTypeArticles()

function onEditTypeArticle () {
  typeArticleFormDialogAction.value = 'update'
  typeArticleFormDialogVisible.value = true
}

function onAddTypeArticle () {
  typeArticleFormDialogAction.value = 'create'
  typeArticleFormDialogVisible.value = true
}

function onDeleteTypeArticle () {
  confirmDialogVisible.value = true
}

async function onConfirmDeletion () {
  if (selectedTypeArticle.value) {
    deletionInLoading.value = true
    await deleteTypeArticle(selectedTypeArticle.value.id)
    deletionInLoading.value = false
  }
}

</script>
