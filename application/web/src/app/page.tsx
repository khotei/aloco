import {Header} from "@/app/header";
import { APIProvider } from '@vis.gl/react-google-maps'
import {WorldMap} from "./world-map";



export default function Home() {
  return (
    <main>
      <Header />
        <WorldMap />
    </main>
  );
}
