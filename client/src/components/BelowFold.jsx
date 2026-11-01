import Amenities from './Amenities';
import Gallery from './Gallery';
import Booking from './Booking';
import HowItWorks from './HowItWorks';
import Rules from './Rules';
import Place from './Place';
import Closing from './Closing';

/*
  Everything after the four chapters. It's a separate chunk: the HTML is already on the page (pre-rendered),
  and React wires it up in a second step, so the first screen becomes interactive sooner.
*/
export default function BelowFold() {
  return (
    <>
      <Amenities />
      <Gallery />
      <Booking />
      <HowItWorks />
      <Rules />
      <Place />
      <Closing />
    </>
  );
}
