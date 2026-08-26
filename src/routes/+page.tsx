import { useNavigate } from "@solidjs/router";
import { onSettled } from "solid-js";

export default function SignInRedirect() {
  const navigate = useNavigate();

  onSettled(() => navigate("/sign-in", { replace: true }));

  return null;
}
