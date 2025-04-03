import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'
import { HttpPaginationResponseI } from '~/types/http'
import { ArticleI } from '../types/article'

// eslint-disable-next-line import/prefer-default-export
export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [] as ArticleI[],
    loading: false,
    cached: false
  }),
  actions: {
    storeArticle (article: ArticleI) {
      return new Promise((resolve) => {
        useFetchApi('/articles', {
          method: 'post',
          body: article
        }).then(({ status, data }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Article ajouté avec succès')

            resolve(data.value)
          }
        })
      })
    },

    fetchArticles (force = false) {
      if (!this.loading && (!this.cached || force)) {
        this.loading = true

        useFetchApi('/articles/all', {
          method: 'get'
        }).then(({ data }) => {
          if (data.value) {
            this.articles = data.value
            this.loading = false
            this.cached = true
          }
        })
      }
    },
    // eslint-disable-next-line max-len
    fetchArticlesWithPagination ({ page, limit }: { page: number, limit: number }): Promise<HttpPaginationResponseI<ArticleI[]>> {
      return new Promise((resolve) => {
        useFetchApi('/articles', {
          method: 'get',
          params: {
            page,
            limit
          }
        }).then(({ data }) => {
          if (data.value) {
            resolve(data.value)
          }
        })
      })
    },
    updateArticle (payload: ArticleI) {
      return new Promise((resolve) => {
        useFetchApi(`/articles/${payload.id}`, {
          method: 'put',
          body: payload
        }).then(({ status, data }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Article modifié avec succès')

            resolve(data.value)
          }
        })
      })
    },
    deleteArticle (articleId: number) {
      return new Promise((resolve) => {
        useFetchApi(`/articles/${articleId}`, {
          method: 'delete'
        }).then(({ status }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Article supprimé avec succès')

            resolve(null)
          }
        })
      })
    }
  }
})
