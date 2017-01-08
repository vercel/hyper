export function create(uid) {
  return (dispatch, getState) => {
    const {sessions} = getState();
    console.log(uid);
    dispatch({
      type: 'CREATED',
      uid
    });
  };
}
