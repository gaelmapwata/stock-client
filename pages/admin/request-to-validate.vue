<template>
  <div class="page-container">
    <v-card rounded="xl" elevation="0" style="overflow: visible; position: relative; z-index: 2;">
      <v-card-text>
        <RequestFiltre
          v-model="filter"
          @filter="handleFilter()"
        />
      </v-card-text>
    </v-card>
    <v-card :loading="requestsLoading" class="mt-2" rounded="xl" elevation="0">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="(headers as any)"
        :items-length="totalItems"
        :items="requests"
        :loading="requestsLoading"
        item-value="id"
        items-per-page-text="Items par page"
        @update:options="loadRequests"
      >
        <template #[`item.index`]="{ index }">
          {{ (itemsPerPage * (page - 1)) + index + 1 }}
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.createdAt ? formatters.formatDateFns(item.createdAt) : '-' }}
        </template>
        <template #[`item.article`]="{ item }">
          {{ item.article.label }}
        </template>
        <template #[`item.requester`]="{ item }">
          {{ item.requester.email }}
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn
            v-if="userHasOneOfPermissions(['REQUEST:VALIDATE'])"
            :disabled="actionInLoading"
            :loading="confirmRequestLoadings[item.id]"
            elevation="0"
            width="150"
            rounded="xl"
            append-icon="mdi-check"
            color="green"
            @click="showConfirmRequestValidationDialog(item)"
          >
            <span class="text-none">Validate</span>
          </v-btn>

          <v-btn
            v-if="userHasOneOfPermissions(['REQUEST:VALIDATE'])"
            :disabled="actionInLoading"
            :loading="cancelRequestLoadings[item.id]"
            elevation="0"
            width="150"
            rounded="xl"
            append-icon="mdi-check"
            color="gray"
            @click="showConfirmCancelRequestDialog(item)"
          >
            <span class="text-none">Cancel</span>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>
    <CommonConfirmDialog
      v-model="confirmDialogVisible"
      :text="textConfirmRequest"
      action-icon="mdi-check"
      action-text="Confirm"

      @confirm="onConfirmRequestValidation"
    />
    <CommonConfirmDialog
      v-model="cancelRequestDialogVisible"
      :text="textConfirmCancelRequest"
      action-icon="mdi-check"
      action-text="Confirm"

      @confirm="onCancelRequest"
    />
  </div>
</template>

<script lang="ts" setup>
import { formatters } from '@/utilities/formatter.util'
import { RequestI } from '~/types/request'
import { useRequestStore } from '~/stores/request'
import { shouldHaveOneOfPermissions, userHasOneOfPermissions } from '~/utilities/auth.util'

definePageMeta({
  layout: 'admin',
  middleware: [(_, __, next) => shouldHaveOneOfPermissions({ next, permissions: ['REQUEST:READ_REQUESTS_TO_VALIDATE'] })]
})

useAdminBreadcrumb('mdi-security', [{
  title: 'Liste de demande à validé',
  href: '/admin/request-to-validate'
}])

const requestStore = useRequestStore()
const { fetchRequestsToValidate, validateRequest, cancelRequest } = requestStore
const itemsPerPage = ref(10)
const page = ref(1)
const requests = ref<RequestI[]>([])
const requestsLoading = ref(false)
const filter = ref<Record<string, string | boolean | number>>({
  success: false
})
const totalItems = ref(0)
const confirmDialogVisible = ref(false)
const cancelRequestDialogVisible = ref(false)
const confirmRequestLoadings = ref<boolean[]>([])
const cancelRequestLoadings = ref<boolean[]>([])
const requestToValidate = ref<RequestI>()

const textConfirmRequest = computed(() => (requestToValidate.value
  ? 'êtes vous sure de confirmer cette  demande'
  : 'No transactions selected'))

const textConfirmCancelRequest = computed(() => (requestToValidate.value
  ? 'êtes vous sure d\'annuler cette  demande'
  : 'No transactions selected'))

const actionInLoading = computed(() => confirmRequestLoadings.value.some(loading => loading) ||
cancelRequestLoadings.value.some(loading => loading))

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: false,
    key: 'index'
  },
  {
    title: 'Date',
    key: 'createdAt',
    sortable: false
  },
  {
    title: 'Quantité demandé',
    key: 'requestQuantity',
    sortable: false
  },
  {
    title: 'Article',
    key: 'article',
    sortable: false
  },
  {
    title: 'Demandé par ',
    key: 'requester',
    sortable: false
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false
  }
]

function handleFilter () {
  page.value = 1
  loadRequests()
}

function showConfirmRequestValidationDialog (request: RequestI) {
  requestToValidate.value = request
  confirmDialogVisible.value = true
}

function showConfirmCancelRequestDialog (request: RequestI) {
  requestToValidate.value = request
  cancelRequestDialogVisible.value = true
}

function onConfirmRequestValidation () {
  if (!requestToValidate.value) { return }

  const requestId = requestToValidate.value.id as number

  confirmRequestLoadings.value[requestId] = true
  validateRequest(requestId)
    .finally(() => {
      confirmRequestLoadings.value[requestId] = false
      loadRequests()
    })
}

function onCancelRequest () {
  if (!requestToValidate.value) { return }

  const requestId = requestToValidate.value.id as number

  cancelRequestLoadings.value[requestId] = true
  cancelRequest(requestId)
    .finally(() => {
      cancelRequestLoadings.value[requestId] = false
      loadRequests()
    })
}

async function loadRequests () {
  requestsLoading.value = true
  const { data, total } = await fetchRequestsToValidate(
    {
      page: page.value,
      limit: itemsPerPage.value,
      filter: { ...filter.value }
    }
  )
  requests.value = data
  totalItems.value = total
  requestsLoading.value = false
}

loadRequests()
</script>
