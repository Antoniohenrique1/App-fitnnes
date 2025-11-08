import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle } from "lucide-react";

interface PartnerCardProps {
  name: string;
  kind: "Personal" | "Nutricionista" | "Fisioterapeuta";
  city: string;
  registration: string;
  bio: string;
  services: string[];
  onContact?: () => void;
}

const kindColors = {
  Personal: "bg-chart-1/20 text-chart-1",
  Nutricionista: "bg-chart-2/20 text-chart-2",
  Fisioterapeuta: "bg-chart-3/20 text-chart-3",
};

export default function PartnerCard({
  name,
  kind,
  city,
  registration,
  bio,
  services,
  onContact,
}: PartnerCardProps) {
  return (
    <Card className="p-6 hover-elevate active-elevate-2">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-lg">
              {name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={kindColors[kind]}>
                  {kind}
                </Badge>
                <span className="text-xs text-muted-foreground">{registration}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {city}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{bio}</p>

        <div className="flex flex-wrap gap-2">
          {services.map((service, index) => (
            <Badge key={index} variant="secondary">
              {service}
            </Badge>
          ))}
        </div>

        <Button
          onClick={onContact}
          className="w-full gap-2"
          data-testid="button-contact-partner"
        >
          <MessageCircle className="w-4 h-4" />
          Entrar em contato
        </Button>
      </div>
    </Card>
  );
}
