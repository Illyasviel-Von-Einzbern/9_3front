<!-- 前端/src/views/register.vue -->
<template>
  <v-container class="mt-10">
    <v-row justify="center">
      <v-col class="text-center" cols="12">
        <h1 class="d-inline-block h1-border mb-3">註冊</h1>
      </v-col>
      <!-- <v-divider class="mb-5" /> -->
      <v-col class="my-container" cols="12" lg="6" md="8">
        <!-- 上傳 Excel -->
        <v-file-input
          accept=".xlsx"
          class="mb-4"
          label="上傳 Excel 進行批次註冊"
          prepend-icon="mdi-upload"
          show-size
          @change="handleExcelUpload"
        />
        <!-- 表單 -->
        <v-form :disabled="form.isSubmitting.value" @submit.prevent="submit">
          <!-- 年級 -->
          <v-select
            v-model="grade.value.value"
            :error-messages="grade.errorMessage.value"
            :items="grades"
            label="年級"
            required
          />
          <!-- 班級 -->
          <v-select
            v-model="classNumber.value.value"
            :error-messages="classNumber.errorMessage.value"
            :items="classNumbers"
            label="班級"
            required
          />
          <!-- 座號 -->
          <v-select
            v-model="studentNumber.value.value"
            :error-messages="studentNumber.errorMessage.value"
            :items="studentNumbers"
            label="座號"
            required
          />
          <!-- <v-text-field
            v-model="account.value.value"
            counter
            :error-messages="account.errorMessage.value"
            label="帳號"
            maxlength="20"
            minlength="4"
            required
          /> -->
          <!-- 自動生成帳號（可編輯） -->
          <v-text-field
            v-model="account.value.value"
            counter
            :error-messages="account.errorMessage.value"
            label="帳號（可自訂）"
            maxlength="20"
            minlength="4"
            required
          />
          <!-- <v-text-field
            v-model="email.value.value"
            :error-messages="email.errorMessage.value"
            label="信箱"
            required
          /> -->
          <v-text-field
            v-model="password.value.value"
            counter
            :error-messages="password.errorMessage.value"
            label="密碼"
            maxlength="20"
            minlength="4"
            required
            type="password"
          />
          <v-text-field
            v-model="confirmPassword.value.value"
            counter
            :error-messages="confirmPassword.errorMessage.value"
            label="確認密碼"
            maxlength="20"
            minlength="4"
            required
            type="password"
          />
          <v-checkbox
            v-model="sameAsAccount"
            label="密碼與帳號相同"
          />
          <div class="d-flex justify-center">
            <v-btn :loading="form.isSubmitting.value" size="large" type="submit">註冊</v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import validator from 'validator'
  import { useField, useForm } from 'vee-validate'
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as XLSX from 'xlsx'
  import * as yup from 'yup'
  import userService from '@/services/user'

  // https://uvr.esm.is/guide/extending-routes.html#definepage
  // definePage({
  //   meta: {
  //     title: '註冊',
  //   },
  // })

  const createSnackbar = useSnackbar()
  const router = useRouter()

  // 選單資料
  const grades = ['114', '115', '116', '117']
  const classNumbers = ['1', '2', '3']
  const studentNumbers = Array.from({ length: 24 }, (_, i) => (i + 1).toString().padStart(2, '0'))

  // 建立 vee-validate 的表單
  const form = useForm({
    validationSchema: yup.object({
      // 用 yup 定義表單驗證格式
      // https://github.com/jquense/yup
      account: yup
        .string()
        // 資料型態是文字
        .required('帳號必須填寫')
        .min(4, '帳號至少需要 4 個字元')
        .max(20, '帳號最多只能 20 個字元')
        .test('isAlphanumeric', '帳號只能包含英文字母和數字', value => {
          // 自訂驗證(驗證名稱, 錯誤訊息, 驗證function)
          return validator.isAlphanumeric(value)
        }),
      // email: yup
      //   .string()
      //   .required('電子郵件必須填寫')
      //   .test('isEmail', '請輸入有效的電子郵件地址', value => {
      //     return validator.isEmail(value)
      //   }),
      password: yup
        .string()
        .required('密碼必須填寫')
        .min(4, '密碼至少需要 4 個字元')
        .max(20, '密碼最多只能 20 個字元'),
      confirmPassword: yup
        .string()
        .required('確認密碼必須填寫')
        .oneOf([yup.ref('password')], '密碼和確認密碼必須相同'),
      // .oneOf(陣列, 訊息)   欄位的值必須是陣列內的其中一個
      // .ref(欄位)          取得欄位的值
      // .ref(password)     password 欄位的值
      grade: yup.string().required('年級必須選擇'),
      classNumber: yup.string().required('班級必須選擇'),
      studentNumber: yup.string().required('座號必須選擇'),
    }),
    // 根據 後端(back)>models>user.js 來設計
  })

  const account = useField('account')
  // const email = useField('email')
  const password = useField('password')
  const confirmPassword = useField('confirmPassword')
  // 建立 vee-validate 的表單欄位
  // 一定要在 useForm 後面
  // useField(欄位名稱)
  const grade = useField('grade')
  const classNumber = useField('classNumber')
  const studentNumber = useField('studentNumber')

  const previousGeneratedAccount = ref('')
  const sameAsAccount = ref(false)

  // ✅ 當 grade/classNumber/studentNumber 任一變動 → 自動更新帳號
  // watchEffect(() => {
  //   if (grade.value.value && classNumber.value.value && studentNumber.value.value) {
  //     const newAccount = `${grade.value.value}${classNumber.value.value}${studentNumber.value.value}`
  //     // 如果使用者還沒改過帳號，才會自動更新帳號欄位
  //     if (
  //       account.value.value === ''
  //       || account.value.value === previousGeneratedAccount.value
  //     ) {
  //       account.value.value = newAccount
  //     }
  //     previousGeneratedAccount.value = newAccount
  //   }
  // })

  watch(
    [() => grade.value.value,
     () => classNumber.value.value,
     () => studentNumber.value.value],
    ([newGrade, newClassNumber, newStudentNumber]) => {
      console.log('grade:', newGrade, 'class:', newClassNumber, 'student:', newStudentNumber)
      if (newGrade && newClassNumber && newStudentNumber) {
        const newAccount = `${newGrade}${newClassNumber}${newStudentNumber}`
        console.log('newAccount:', newAccount)
        if (
          // account.value.value === ''
          !account.value.value // ⬅️ 這裡改成這樣
          || account.value.value === previousGeneratedAccount.value
        ) {
          account.value.value = newAccount
        }
        previousGeneratedAccount.value = newAccount
      }
    },
  )
  // | 值           | 解釋        |
  // | ----------- | --------- |
  // | `''`        | 空字串       |
  // | `0`         | 數值 0      |
  // | `false`     | 布林值 false |
  // | `undefined` | 未定義       |
  // | `null`      | 空值        |
  // | `NaN`       | 非數值       |
  // !account.value.value 的判斷條件範圍比 === '' 更廣、更安全。
  // | 表達式      | 判斷的是？           | 使用場景                |
  // | -------- | --------------- | ------------------- |
  // | `=== ''` | 僅檢查「是不是空字串」     | 嚴格判斷，僅限手動清空情況       |
  // | `!value` | 判斷「是不是沒有值」（更寬鬆） | 比較通用，適用初始化、未填、清空等情況 |

  watch([sameAsAccount, account.value], ([isChecked, newAccount]) => {
    if (isChecked) {
      password.value.value = newAccount
      confirmPassword.value.value = newAccount
      console.log('password:', password.value.value)
      console.log('confirmPassword:', confirmPassword.value.value)
    }
  })
  // 同步帳號→密碼的 watch

  // 送出 vee-validate 的表單
  const submit = form.handleSubmit(async values => {
    // handleSubmit(處理function)
    // values 表單所有欄位的值
    try {
      const gradeLabel = `${values.grade}年${values.classNumber}期`

      await userService.create({
        account: values.account,
        // email: values.email,
        password: values.password,
        grade: gradeLabel,
      })
      createSnackbar({
        text: '註冊成功！',
        snackbarProps: {
          color: 'green',
        },
      })
      router.push('/login')
      // 註冊成功後，導向到登入頁面
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: error?.response?.data?.message || '註冊失敗，請稍後再試！',
        snackbarProps: {
          color: 'red',
        },
      })
    }
  })

  // 解析 Excel 的邏輯
  const handleExcelUpload = async file => {
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet)

      // 預期欄位：年級, 班級, 座號（可選帳號與密碼）
      const users = json.map(row => {
        const grade = String(row['年級'] || '')
        const classNumber = String(row['班級'] || '')
        const studentNumber = String(row['座號'] || '').padStart(2, '0')

        const account = row['帳號'] || `${grade}${classNumber}${studentNumber}`
        const password = row['密碼'] || account

        return {
          account,
          password,
          grade: `${grade}年${classNumber}期`,
        }
      })

      await batchRegister(users)
    } catch (error) {
      console.error('Excel 解析失敗', error)
      createSnackbar({
        text: 'Excel 檔案格式有誤，請確認內容',
        snackbarProps: { color: 'red' },
      })
    }
  }

  // 後端 API 的批次註冊方法
  const batchRegister = async userList => {
    try {
      const res = await userService.batchCreate(userList)

      const { success, failed } = res.data

      createSnackbar({
        text: `註冊成功 ${success} 筆，失敗 ${failed.length} 筆`,
        snackbarProps: { color: 'green' },
      })

      if (failed.length > 0) {
        console.warn('失敗項目:', failed)
      }
    } catch (error) {
      console.error(error)
      createSnackbar({
        text: '批量註冊失敗，請稍後再試',
        snackbarProps: { color: 'red' },
      })
    }
  }

</script>

<style scope>
.my-container {
  border: 1px solid #CFB53B;
  border-radius: 12px;
  padding: 30px 50px;
}
.h1-border{
  border-bottom: 1px solid #CFB53B;;
}
</style>

<!-- https://uvr.esm.is/guide/extending-routes.html#sfc-route-custom-block -->
<route lang="yaml">
  meta:
    title: '註冊'
    # 標題
    # login: 'no-login-only'
    # 只能在沒登入的情況下看
    login: ''
    # admin: false
    # 不是管理員也能看
    admin: true
</route>
