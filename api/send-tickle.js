CREATE OR REPLACE FUNCTION decrement_sender_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET tickle_balance = COALESCE(tickle_balance, 0) - COALESCE(NEW.amount, 1)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrement_sender_balance ON tickles;

CREATE TRIGGER trg_decrement_sender_balance
AFTER INSERT ON tickles
FOR EACH ROW
EXECUTE FUNCTION decrement_sender_balance();
