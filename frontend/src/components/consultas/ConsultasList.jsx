import ConsultaCard from "./ConsultaCard";

function ConsultasList({
  consultas,
  isAdmin,
  onResponder, 
  theme
}) {

  return (
    <>
      {consultas.map(c => (

        <ConsultaCard
          key={c.id}
          consulta={c}
          isAdmin={isAdmin}
          onSaveRespuesta={onResponder}
          theme={theme}
        />

      ))}
    </>
  );
}

export default ConsultasList;