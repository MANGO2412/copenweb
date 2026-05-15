import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"


import supabase from "@/lib/supabase"

function Login() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const {data, error} = await supabase.auth.signInWithPassword({ email, password})
      if (error) throw error
      console.log("Login successful:", data)

      console.log("Fetching user data...")
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      console.log("User data:", userData)

    } catch (error) {
      console.error("Login error:", error)
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      console.log("Login attempt:", { email, password })
    }, 1000)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-muted  via-white to-teal-50/30 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.06),transparent_50%)]" />
      
      <Card className="w-full max-w-md relative overflow-hidden border-0 shadow-2xl shadow-slate-200/50">
        <CardHeader className="space-y-4 text-center pb-2">
          <img src="/Frame-1.ico" alt="CopenSoft Logo" className="mx-auto w-14 h-14 items-center justify-center  shadow-lg shadow-blue-500/20" />
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-800">{t('login.title')}</CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              {t('login.subtitle')}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t('login.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                {t('login.password')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
                required
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-foreground hover:text-foreground/80 font-medium transition-colors"
              >
                {t('login.forgotPassword')}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-linear-to-r from-blue-500 to-foreground/75 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-teal-500/25 transition-all"
              disabled={isLoading}
            >
              {isLoading ? t('login.loggingIn') : t('login.loginButton')}
            </Button>
          </form>
        </CardContent>

        <div className="px-6 pb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">{t('login.healthSystem')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Login