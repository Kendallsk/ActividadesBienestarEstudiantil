import BurbujasAlivio from '../../../components/actividades/BurbujasAlivio';
import TrazoZen from '../../../components/actividades/TrazoZen';
import RespiracionGuia from '../../../components/actividades/RespiracionGuia';
import RespiracionMontana from '../../../components/actividades/RespiracionMontana';
import RollercoasterZen from '../../../components/actividades/RollercoasterZen';
import InteraccionMontana from '../../../components/actividades/InteraccionMontana';
import RollercoasterBreathe from '../../../components/actividades/RollercoasterBreathe';
import Globos from '../../../components/actividades/globos';
import Pensamientos from '../../../components/actividades/Pensamientos';
import MeditacionGuiada from '../../../components/actividades/MeditacionGuiada';
import BurbujasEmocionales from '../../../components/actividades/BurbujasEmocionales';
import ArbolBienestar from '../../../components/actividades/ArbolBienestar';
import ActivityRuntimeShell from '../../../components/actividades/ActivityRuntimeShell';
import { ACTIVITY_INFO } from '../../../lib/activity-info';
import { notFound } from 'next/navigation';

export default async function EmbedActivityPage({ params }: { params: Promise<{ activity: string }> }) {
  const { activity } = await params;

  let ActivityComponent = null;

  switch (activity) {
    case 'respiracion-guia':
      ActivityComponent = RespiracionGuia;
      break;
    case 'respiracion-montana':
      ActivityComponent = RespiracionMontana;
      break;
    case 'rollercoaster-breathe':
      ActivityComponent = RollercoasterBreathe;
      break;
    case 'rollercoaster-zen':
      ActivityComponent = RollercoasterZen;
      break;
    case 'burbujas-alivio':
      ActivityComponent = BurbujasAlivio;
      break;
    case 'trazo-zen':
      ActivityComponent = TrazoZen;
      break;
    case 'interaccion-montana':
      ActivityComponent = InteraccionMontana;
      break;
    case 'globos':
      ActivityComponent = Globos;
      break;
    case 'pensamientos':
      ActivityComponent = Pensamientos;
      break;
    case 'meditacion-guiada':
      ActivityComponent = MeditacionGuiada;
      break;
    case 'burbujas-emocionales':
      ActivityComponent = BurbujasEmocionales;
      break;
    case 'arbol-bienestar':
      ActivityComponent = ArbolBienestar;
      break;
    default:
      notFound();
  }

  return (
    <ActivityRuntimeShell activity={activity} info={ACTIVITY_INFO[activity]}>
      <ActivityComponent />
    </ActivityRuntimeShell>
  );
}
