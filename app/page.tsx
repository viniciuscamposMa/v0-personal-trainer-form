import PersonalTrainerForm from "@/components/personal-trainer-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <img
            src="/images/logo-clifton-personal-perfil-removebg-preview.png"
            alt="Clifton Personal"
            className="mx-auto mb-4 h-32 w-auto"
          />
          <h1 className="text-4xl font-bold text-neutral-900">Formulário de Avaliação</h1>
          <p className="mt-2 text-lg text-neutral-600">Complete os dados para iniciar sua consultoria</p>
        </div>
        <PersonalTrainerForm />
      </div>
    </main>
  )
}
