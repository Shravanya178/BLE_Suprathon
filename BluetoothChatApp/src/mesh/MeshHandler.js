export const handleMeshMessage = (msg, broadcast) => {
  if (msg.ttl > 0) {
    msg.ttl--;
    broadcast(msg);
  }
};
