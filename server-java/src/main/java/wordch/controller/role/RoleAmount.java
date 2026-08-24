package wordch.controller.role;

import java.util.List;

public class RoleAmount {

    private String dealer;
    private List<String> playerList;

    public RoleAmount() {
    }

    public RoleAmount(RoleAmount RoleAmount) {
        this.dealer = RoleAmount.getDealer();
        this.playerList = RoleAmount.getPlayerList();
    }

    public String getDealer() {
        return dealer;
    }

    public List<String> getPlayerList() {
        return playerList;
    }

    public void setDealer(String dealer) {
        this.dealer = dealer;
    }

    public void setPlayerList(List<String> playerList) {
        this.playerList = playerList;
    }


}