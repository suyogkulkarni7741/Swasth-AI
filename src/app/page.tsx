  import {auth} from "@/lib/auth";
  import {HomeView} from "@/modules/home/ui/views/home-view";
  import { headers } from "next/headers";

  const Page= async ()=>{
    const session = await auth.api.getSession({
      headers : await headers()
    })
    return <HomeView/>
  }


  export default Page;