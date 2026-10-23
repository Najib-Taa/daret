// Daret — simulateur. Ton code commence ici.
// Le HTML (index.html) est déjà intégré : lis-le, repère les id et les data-*, puis fais-le vivre.
const nomCercle = document.getElementById("nom-cercle");
nomCercle.addEventListener("input", function () {
  console.log(nomCercle.value);
});