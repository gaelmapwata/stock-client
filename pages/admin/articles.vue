<template>
  <div class="page-container">
    <div class="d-flex mb-4 justify-end">
      <v-btn
        v-if="userHasOneOfPermissions(['ARTICLE:CREATE'])"
        prepend-icon="mdi-plus"
        color="primary"
        rounded="xl"
        @click="onAddArticle()"
      >
        <span class="text-none">Ajouter</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['ARTICLE:UPDATE'])"
        :disabled="!selectedArticle"
        prepend-icon="mdi-pencil"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onEditArticle()"
      >
        <span class="text-none">Modifier</span>
      </v-btn>
      <v-btn
        v-if="userHasOneOfPermissions(['ARTICLE:DELETE'])"
        :disabled="!selectedArticle || deletionInLoading"
        :loading="deletionInLoading"
        prepend-icon="mdi-delete"
        color="white"
        rounded="xl"
        class="ml-2"
        @click="onDeleteArticle()"
      >
        <span class="text-none">Supprimer</span>
      </v-btn>
    </div>
    <v-card rounded="xl" elevation="0">
      <template #text>
        <v-data-table-server
          v-model="selectedArticles"
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items-length="totalItems"
          :headers="(headers as any)"
          :items="articles"
          :loading="articlesLoading"
          items-per-page-text="Items par page"
          item-value="id"
          select-strategy="single"
          show-select
          return-object
          @update:options="loadArticles"
        >
          <template #[`item.index`]="{ index }">
            {{ (itemsPerPage * (page - 1)) + index + 1 }}
          </template>
          <template #[`item.typeArticles`]="{ item }">
            <v-chip-group>
              <v-chip>
                {{ item.typeArticle.label }}
              </v-chip>
            </v-chip-group>
          </template>
        </v-data-table-server>
      </template>
    </v-card>
    <ArticleFormDialog
      v-model="articleFormDialogVisible"
      :action="articleFormDialogAction"
      :entity="selectedArticle || undefined"
      @created="refreshArticles()"
      @updated="refreshArticles()"
    />
    <CommonConfirmDialog
      v-model="confirmDialogVisible"
      :text="textConfirmDeletion"
      @confirm="onConfirmDeletion"
    />
  </div>
</template>

<script lang="ts" setup>
import { useArticleStore } from '@/stores/article'
import { shouldHaveOneOfPermissions, userHasOneOfPermissions } from '@/utilities/auth.util'
import { ArticleI } from '~/types/article'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({ next, permissions: ['ARTICLE:READ'] })]

})

useAdminBreadcrumb('mdi-account-group', [{
  title: 'Articles',
  href: '/admin/articles'
}])

const articleStore = useArticleStore()
const { fetchArticlesWithPagination, deleteArticle } = articleStore

const itemsPerPage = ref(10)
const page = ref(1)
const selectedArticles = ref([])
const articles = ref<ArticleI[]>([])
const totalItems = ref(0)
const articleFormDialogVisible = ref(false)
const articleFormDialogAction = ref<string | undefined>(undefined)
const confirmDialogVisible = ref(false)
const deletionInLoading = ref(false)
const articlesLoading = ref(false)

const textConfirmDeletion = computed(
  () => `Voulez-vous vraiment supprimer l'utilisateur <strong>"${selectedArticle.value?.label}"</strong> ?`
)

const selectedArticle = computed<ArticleI | null>(
  () => (selectedArticles.value.length > 0 ? selectedArticles.value[0] : null)
)

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: false,
    key: 'index'
  },
  {
    title: 'label',
    key: 'label'
  },
  {
    title: 'Type article',
    key: 'typeArticles'
  }
]

function onEditArticle () {
  articleFormDialogAction.value = 'update'
  articleFormDialogVisible.value = true
}

function onAddArticle () {
  articleFormDialogAction.value = 'create'
  articleFormDialogVisible.value = true
}

function onDeleteArticle () {
  confirmDialogVisible.value = true
}

async function onConfirmDeletion () {
  if (selectedArticle.value) {
    deletionInLoading.value = true
    await deleteArticle(selectedArticle.value.id)
    refreshArticles()
    deletionInLoading.value = false
  }
}

function refreshArticles () {
  loadArticles({
    page: page.value,
    itemsPerPage: itemsPerPage.value
  })
}

async function loadArticles (payload: { page: number, itemsPerPage: number }) {
  articlesLoading.value = true
  const { data, total } = await fetchArticlesWithPagination(
    { page: payload.page, limit: payload.itemsPerPage }
  )
  articles.value = data
  totalItems.value = total
  articlesLoading.value = false
}
</script>
