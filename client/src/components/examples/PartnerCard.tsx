import PartnerCard from "../PartnerCard";

export default function PartnerCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-background">
      <PartnerCard
        name="Carlos Mendes"
        kind="Personal"
        city="São Paulo, SP"
        registration="CREF 123456-G/SP"
        bio="Personal trainer especializado em hipertrofia e reabilitação funcional. 8 anos de experiência."
        services={["Treino Personalizado", "Avaliação Física", "Consultoria Online"]}
        onContact={() => console.log("Contact personal trainer")}
      />
      <PartnerCard
        name="Ana Paula Silva"
        kind="Nutricionista"
        city="Rio de Janeiro, RJ"
        registration="CRN 98765/RJ"
        bio="Nutricionista esportiva com foco em performance e composição corporal."
        services={["Plano Alimentar", "Acompanhamento Mensal", "Suplementação"]}
        onContact={() => console.log("Contact nutritionist")}
      />
    </div>
  );
}
