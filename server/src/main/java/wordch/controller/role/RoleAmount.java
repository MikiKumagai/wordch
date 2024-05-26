package wordch.controller.role;

public class RoleAmount {

    private Integer player;
    private Integer dealer;

    public RoleAmount() {
    }

    public RoleAmount(RoleAmount RoleAmount) {
        this.player = RoleAmount.getPlayer();
        this.dealer = RoleAmount.getDealer();
    }

    public Integer getPlayer() {
        return player;
    }

    public Integer getDealer() {
        return dealer;
    }

    public void setPlayer(Integer player) {
        this.player = player;
    }

    public void setDealer(Integer dealer) {
        this.dealer = dealer;
    }


}