import React from "react";
import { auth } from "@/lib/auth";
import { SignInview } from "@/modules/auth/ui/views/sign-in-view";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) {
    redirect("/");
  }

  return <SignInview />;
};

export default page;
