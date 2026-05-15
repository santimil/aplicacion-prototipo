import ConsultaCard from "./ConsultaCard";

function ConsultasList({
  consultas,
  isAdmin,
  onResponder
}) {

  return (
    <>
      {consultas.map(c => (

        <ConsultaCard
          key={c.id}
          consulta={c}
          isAdmin={isAdmin}
          onSaveRespuesta={onResponder}
        />

      ))}
    </>
  );
}

export default ConsultasList;